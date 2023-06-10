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
import { type ThisMarker } from "~/code/bundle";

export class RectSolid
    implements SolidShape, HasVertices, PointMap, Interpolate {
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

    constructor(x: number, y: number, width: number, height: number, public ctx_setter?: (ctx: CanvasRenderingContext2D) => void) {
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
        ) as this & ThisMarker;
    }

    to_start() {
        return new RectSolid(
            this.x + this.width / 2,
            this.y + this.height / 2,
            0,
            0,
            this.ctx_setter
        ) as this & ThisMarker;
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
        ) as this & ThisMarker;
    }

    scale(scale: number, offset?: Point) {
        const offsetX = offset?.x ?? 0;
        const offsetY = offset?.y ?? 0;
        return new RectSolid(
            this.x * scale + offsetX,
            this.y * scale + offsetY,
            this.width * scale,
            this.height * scale,
            this.ctx_setter
        ) as this & ThisMarker;
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
                ) as this & ThisMarker;
            case "y":
                return new RectSolid(
                    this.x,
                    -this.y - this.height,
                    this.width,
                    this.height,
                    this.ctx_setter
                ) as this & ThisMarker;
            case "both":
                return new RectSolid(
                    -this.x - this.width,
                    -this.y - this.height,
                    this.width,
                    this.height,
                    this.ctx_setter
                ) as this & ThisMarker;
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

    approximated(): PolygonSolid {
        return new PolygonSolid([...this.vertices()]);
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
        return new RectSolid(tl.x, tl.y, br.x - tl.x, br.y - tl.y, this.ctx_setter) as this &
            ThisMarker;
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
        other: RectSolid
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

    intersects(other: RectSolid): boolean {
        return this.relation_to(other) !== "disjoint";
    }

    outline_intersects(other: RectSolid): boolean {
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

    render_outline(ctx: CanvasRenderingContext2D): void {
        this.ctx_setter && this.ctx_setter(ctx);
        ctx.beginPath();
        this.select_shape(ctx);
        ctx.stroke();
    }

    render_fill(ctx: CanvasRenderingContext2D): void {
        this.ctx_setter && this.ctx_setter(ctx);
        ctx.beginPath();
        this.select_shape(ctx);
        ctx.fill();
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        debug_context(ctx, (ctx) => {
            this.vertices().map((p) => p.to_circle_solid(2).render_fill(ctx));
        });
    }

    distribute_grid(min_n: number): Point[] {
        const n_x = Math.ceil(Math.sqrt((min_n * this.width) / this.height));
        const n_y = Math.ceil(min_n / n_x);
        const dx = this.width / n_x;
        const dy = this.height / n_y;
        return range(n_x).flatMap((i) =>
            range(n_y).map((j) => new Point(this.x + i * dx, this.y + j * dy))
        );
    }

    set_setter(ctx_setter: (ctx: CanvasRenderingContext2D) => void) {
        this.ctx_setter = ctx_setter;
        return this as this & ThisMarker;
    }
}
