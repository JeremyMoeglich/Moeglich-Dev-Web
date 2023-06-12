import { cyclic_pairs, panic, range } from "functional-utilities";
import type { Axis } from "./types";
import { Point } from "./point";
import { PolygonSolid } from "./polygon_solid";
import { sample_amount_default } from "../funcs/sample_amount";
import { sample } from "lodash-es";
import { TriangleSolid } from "./triangle_solid";
import { LineSegment } from "./line_segment";
import { debug_context } from "../funcs/render_debug";
import type { Interpolate } from "~/code/funcs/interpolator";
import { v4 } from "uuid";
import { type PointMap } from "./interfaces/pointmap";
import { type SolidShape } from "./interfaces/solidshape";
import { type HasVertices } from "./interfaces/hasvertices";
import { type ThisReturn } from "~/code/bundle";
import { shapeaction } from "~/code/funcs/shapeact";

export class RectSolid
    implements SolidShape, HasVertices, PointMap, Interpolate
{
    x: number;
    y: number;
    width: number;
    height: number;

    private cache: {
        id?: string;
    } = {};

    id(): string {
        if (this.cache.id) return this.cache.id;
        const id = v4();
        this.cache.id = id;
        return id;
    }

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        public ctx_setter?: (ctx: CanvasRenderingContext2D) => void
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static empty(): RectSolid {
        return new RectSolid(0, 0, 0, 0);
    }

    static union(rects: RectSolid[]): RectSolid {
        const x = Math.min(...rects.map((r) => r.x));
        const y = Math.min(...rects.map((r) => r.y));
        const width = Math.max(...rects.map((r) => r.x + r.width)) - x;
        const height = Math.max(...rects.map((r) => r.y + r.height)) - y;
        return new RectSolid(x, y, width, height);
    }

    interpolate(t: number, to: this) {
        return new RectSolid(
            this.x * (1 - t) + to.x * t,
            this.y * (1 - t) + to.y * t,
            this.width * (1 - t) + to.width * t,
            this.height * (1 - t) + to.height * t,
            this.ctx_setter
        ) as this & ThisReturn;
    }

    to_start() {
        return new RectSolid(
            this.x + this.width / 2,
            this.y + this.height / 2,
            0,
            0,
            this.ctx_setter
        ) as this & ThisReturn;
    }

    similarity(to: this): number {
        const x = Math.abs(this.x - to.x);
        const y = Math.abs(this.y - to.y);
        const width = Math.abs(this.width - to.width);
        const height = Math.abs(this.height - to.height);
        return x + y + width + height;
    }

    can_interpolate(value: unknown): value is this {
        return value instanceof RectSolid;
    }

    toString(): string {
        return `Rect(${this.x}, ${this.y}, ${this.width}, ${this.height})`;
    }

    translate(p: Point) {
        return new RectSolid(
            this.x + p.x,
            this.y + p.y,
            this.width,
            this.height,
            this.ctx_setter
        ) as this & ThisReturn;
    }

    scale(scale: number | Point, origin?: Point) {
        const o = origin ?? this.center();
        const scale_x = typeof scale === "number" ? scale : scale.x;
        const scale_y = typeof scale === "number" ? scale : scale.y;
        return new RectSolid(
            this.x * scale_x + o.x * (1 - scale_x),
            this.y * scale_y + o.y * (1 - scale_y),
            this.width * scale_x,
            this.height * scale_y,
            this.ctx_setter
        ) as this & ThisReturn;
    }

    flip(axis: Axis) {
        switch (axis) {
            case "x":
                return new RectSolid(
                    -this.x - this.width,
                    this.y,
                    this.width,
                    this.height,
                    this.ctx_setter
                ) as this & ThisReturn;
            case "y":
                return new RectSolid(
                    this.x,
                    -this.y - this.height,
                    this.width,
                    this.height,
                    this.ctx_setter
                ) as this & ThisReturn;
            case "both":
                return new RectSolid(
                    -this.x - this.width,
                    -this.y - this.height,
                    this.width,
                    this.height,
                    this.ctx_setter
                ) as this & ThisReturn;
        }
    }

    recenter(axis: Axis) {
        const offset = this.center().to_axis(axis).negate();
        return this.translate(offset);
    }

    rotate(angle: number, origin?: Point | undefined) {
        const o = origin ?? this.center();
        const rotator = o.as_center(angle);
        return this.map_points(rotator);
    }

    center(): Point {
        return new Point(this.x + this.width / 2, this.y + this.height / 2);
    }

    bbox(): RectSolid {
        return this;
    }

    area(): number {
        return this.width * this.height;
    }

    to_polygon(): PolygonSolid {
        return new PolygonSolid([...this.vertices()]);
    }

    approximated(): PolygonSolid {
        return this.to_polygon();
    }

    sample_points_area(n: number): Point[] {
        return range(n).map(
            (_) =>
                new Point(
                    this.x + Math.random() * this.width,
                    this.x + Math.random() * this.height
                )
        );
    }

    outline_length(): number {
        return 2 * (this.width + this.height);
    }

    sample_on_area(min_per_unit: number, variant: "min" | "rng"): Point[] {
        const n = sample_amount_default(this.area(), min_per_unit, variant);
        return this.sample_points_area(n);
    }

    vertices(): Point[] {
        return [
            new Point(this.x, this.y),
            new Point(this.x + this.width, this.y),
            new Point(this.x + this.width, this.y + this.height),
            new Point(this.x, this.y + this.height),
        ];
    }

    sample_on_length(min_per_unit: number, variant: "evenly" | "rng"): Point[] {
        const n = Math.ceil(this.outline_length() * min_per_unit);
        const lines = cyclic_pairs(this.vertices()).map(
            ([a, b]) => new LineSegment(a, b)
        );
        if (variant === "rng") {
            return range(n).flatMap((_) => {
                const line =
                    sample(lines) ??
                    panic("No line to sample from, (this should never happen)");
                return line.sample_points(1, "rng");
            });
        } else {
            const n_per_line = Math.ceil(n / lines.length);
            return lines.flatMap((line) =>
                line.sample_points(n_per_line, "evenly")
            );
        }
    }

    triangulate(): TriangleSolid[] {
        return [
            new TriangleSolid(
                new Point(this.x, this.y),
                new Point(this.x + this.width, this.y),
                new Point(this.x + this.width, this.y + this.height)
            ),
            new TriangleSolid(
                new Point(this.x, this.y),
                new Point(this.x + this.width, this.y + this.height),
                new Point(this.x, this.y + this.height)
            ),
        ];
    }

    map_points(f: (p: Point) => Point) {
        const tl = f(new Point(this.x, this.y));
        const br = f(new Point(this.x + this.width, this.y + this.height));
        return new RectSolid(
            tl.x,
            tl.y,
            br.x - tl.x,
            br.y - tl.y,
            this.ctx_setter
        ) as this & ThisReturn;
    }

    contains(p: Point): boolean {
        return (
            p.x >= this.x &&
            p.x <= this.x + this.width &&
            p.y >= this.y &&
            p.y <= this.y + this.height
        );
    }

    relation_to(
        other: this
    ):
        | "this_inside_other"
        | "other_inside_this"
        | "outline_intersect"
        | "disjoint" {
        if (
            this.x >= other.x &&
            this.x + this.width <= other.x + other.width &&
            this.y >= other.y &&
            this.y + this.height <= other.y + other.height
        ) {
            return "this_inside_other";
        } else if (
            other.x >= this.x &&
            other.x + other.width <= this.x + this.width &&
            other.y >= this.y &&
            other.y + other.height <= this.y + this.height
        ) {
            return "other_inside_this";
        } else if (
            this.x + this.width < other.x ||
            this.x > other.x + other.width ||
            this.y + this.height < other.y ||
            this.y > other.y + other.height
        ) {
            return "disjoint";
        } else {
            return "outline_intersect";
        }
    }

    intersects(other: this): boolean {
        return this.relation_to(other) !== "disjoint";
    }

    outline_intersects(other: this): boolean {
        return this.relation_to(other) === "outline_intersect";
    }

    lines(): LineSegment[] {
        return cyclic_pairs(this.vertices()).map(
            ([a, b]) => new LineSegment(a, b)
        );
    }

    right_point_intersections(p: Point): number {
        if (p.x < this.x) {
            return 2;
        } else if (p.x > this.x + this.width) {
            return 0;
        } else {
            return 1;
        }
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        ctx.rect(this.x, this.y, this.width, this.height);
    }

    render(ctx: CanvasRenderingContext2D, action: "fill" | "stroke"): void {
        this.ctx_setter && this.ctx_setter(ctx);
        ctx.beginPath();
        this.select_shape(ctx);
        shapeaction(ctx, action);
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        debug_context(ctx, (ctx) => {
            this.vertices().map((p) =>
                p.to_circle_solid(2).render(ctx, "fill")
            );
        });
    }

    distribute_grid(min_n: number): Point[] {
        const n_x = Math.ceil(Math.sqrt((min_n * this.width) / this.height));
        const n_y = Math.ceil(min_n / n_x);
        const dx = this.width / (n_x + 1); // Adjusted to have n_x + 1 gaps
        const dy = this.height / (n_y + 1); // Adjusted to have n_y + 1 gaps
        return range(1, n_x + 1).flatMap((i) =>  // Starting from 1 to have a gap at the beginning
            range(1, n_y + 1).map((j) => new Point(this.x + i * dx, this.y + j * dy)) // Starting from 1 to have a gap at the beginning
        );
    }
    

    set_setter(ctx_setter: (ctx: CanvasRenderingContext2D) => void) {
        this.ctx_setter = ctx_setter;
        return this as this & ThisReturn;
    }
}
