import { cyclic_pairs, panic, range } from "functional-utilities";
import type { Axis, HasVertices, PointMap, SolidShape } from "./interfaces";
import { Point } from "./point";
import { PolygonSolid } from "./polygon_solid";
import { sample_amount_default } from "../funcs/sample_amount";
import { sample } from "lodash-es";
import { TriangleSolid } from "./triangle_solid";
import { LineSegment } from "./line_segment";
import { debug_context } from "../funcs/render_debug";
import { ShapeSet } from "./shape_set";
import type { Interpolate } from "~/code/funcs/interpolator";

export class RectSolid
    implements SolidShape, HasVertices, PointMap, Interpolate
{
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static union(rects: RectSolid[]): RectSolid {
        const x = Math.min(...rects.map((r) => r.x));
        const y = Math.min(...rects.map((r) => r.y));
        const width = Math.max(...rects.map((r) => r.x + r.width)) - x;
        const height = Math.max(...rects.map((r) => r.y + r.height)) - y;
        return new RectSolid(x, y, width, height);
    }

    interpolate(t: number, to: this): this {
        return new RectSolid(
            this.x * (1 - t) + to.x * t,
            this.y * (1 - t) + to.y * t,
            this.width * (1 - t) + to.width * t,
            this.height * (1 - t) + to.height * t
        ) as this;
    }

    toString(): string {
        return `Rect(${this.x}, ${this.y}, ${this.width}, ${this.height})`;
    }

    translate(p: Point): this {
        return new RectSolid(
            this.x + p.x,
            this.y + p.y,
            this.width,
            this.height
        ) as this;
    }

    scale(scale: number, offset?: Point): this {
        const offsetX = offset?.x ?? 0;
        const offsetY = offset?.y ?? 0;
        return new RectSolid(
            this.x * scale + offsetX,
            this.y * scale + offsetY,
            this.width * scale,
            this.height * scale
        ) as this;
    }

    flip(axis: Axis): this {
        switch (axis) {
            case "x":
                return new RectSolid(
                    -this.x - this.width,
                    this.y,
                    this.width,
                    this.height
                ) as this;
            case "y":
                return new RectSolid(
                    this.x,
                    -this.y - this.height,
                    this.width,
                    this.height
                ) as this;
            case "both":
                return new RectSolid(
                    -this.x - this.width,
                    -this.y - this.height,
                    this.width,
                    this.height
                ) as this;
        }
    }

    recenter(axis: Axis): this {
        const offset = this.center().to_axis(axis).negate();
        return this.translate(offset);
    }

    rotate(angle: number, origin?: Point | undefined): this {
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

    triangulate(): ShapeSet<TriangleSolid> {
        return new ShapeSet([
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
        ]);
    }

    map_points(f: (p: Point) => Point): this {
        const tl = f(new Point(this.x, this.y));
        const br = f(new Point(this.x + this.width, this.y + this.height));
        return new RectSolid(tl.x, tl.y, br.x - tl.x, br.y - tl.y) as this;
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
        ctx.beginPath();
        this.select_shape(ctx);
        ctx.stroke();
    }

    render_fill(ctx: CanvasRenderingContext2D): void {
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
}
