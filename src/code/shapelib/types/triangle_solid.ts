import { cyclic_pairs } from "functional-utilities";
import { sample_amount_default } from "../funcs/sample_amount";
import type { Axis, PointMap, SolidShape } from "./interfaces";
import { Point } from "./point";
import { PolygonSolid } from "./polygon_solid";
import { RectSolid } from "./rect_solid";
import { LineSegment } from "./line_segment";
import { debug_context } from "../funcs/render_debug";
import { ShapeSet } from "./shape_set";

export class TriangleSolid implements SolidShape, PointMap {
    a: Point;
    b: Point;
    c: Point;

    constructor(a: Point, b: Point, c: Point) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    toString(): string {
        return `TriangleSolid(${this.a.toString()}, ${this.b.toString()}, ${this.c.toString()})`;
    }

    translate(p: Point): this {
        return new TriangleSolid(
            this.a.translate(p),
            this.b.translate(p),
            this.c.translate(p)
        ) as this;
    }

    scale(scale: number, origin = new Point(0, 0)): this {
        return new TriangleSolid(
            this.a.scale(scale, origin),
            this.b.scale(scale, origin),
            this.c.scale(scale, origin)
        ) as this;
    }

    flip(axis: Axis): this {
        return new TriangleSolid(
            this.a.flip(axis),
            this.b.flip(axis),
            this.c.flip(axis)
        ) as this;
    }

    map_points(f: (p: Point) => Point): this {
        return new TriangleSolid(f(this.a), f(this.b), f(this.c)) as this;
    }

    bbox(): RectSolid {
        const xv = [this.a.x, this.b.x, this.c.x];
        const yv = [this.a.y, this.b.y, this.c.y];

        const mx = Math.min(...xv);
        const my = Math.min(...yv);
        const Mx = Math.max(...xv);
        const My = Math.max(...yv);

        return new RectSolid(mx, my, Mx - mx, My - my);
    }

    approximated(): PolygonSolid {
        return new PolygonSolid([this.a, this.b, this.c]);
    }

    area(): number {
        return (
            Math.abs(
                this.a.x * this.b.y -
                    this.a.y * this.b.x +
                    this.b.x * this.c.y -
                    this.b.y * this.c.x +
                    this.c.x * this.a.y -
                    this.c.y * this.a.x
            ) / 2
        );
    }

    triangulate(): ShapeSet<TriangleSolid> {
        return new ShapeSet<TriangleSolid>([this]);
    }

    sample_points(amount: number): Point[] {
        const points = [];
        for (let i = 0; i < amount; i++) {
            const u = Math.random();
            const v = Math.random();
            const w = Math.random();
            const s = u + v + w;
            points.push(
                new Point(
                    (this.a.x * u + this.b.x * v + this.c.x * w) / s,
                    (this.a.y * u + this.b.y * v + this.c.y * w) / s
                )
            );
        }
        return points;
    }

    sample_on_area(per_unit: number, variant: "min" | "rng"): Point[] {
        const amount = sample_amount_default(this.area(), per_unit, variant);
        return this.sample_points(amount);
    }

    sample_on_length(min_per_unit: number, variant: "rng" | "evenly"): Point[] {
        const lines = cyclic_pairs(this.vertices()).map(
            ([a, b]) => new LineSegment(a, b)
        );
        return lines.flatMap((l) => l.sample_on_length(min_per_unit, variant));
    }

    outline_length(): number {
        return cyclic_pairs(this.vertices())
            .map(([a, b]) => a.distance(b))
            .reduce((a, b) => a + b, 0);
    }

    vertices(): Point[] {
        return [this.a, this.b, this.c];
    }

    contains(p: Point): boolean {
        const { a, b, c } = this;

        // Check if the point is inside the triangle using the point-in-polygon algorithm
        const v0x = c.x - a.x;
        const v0y = c.y - a.y;
        const v1x = b.x - a.x;
        const v1y = b.y - a.y;
        const v2x = p.x - a.x;
        const v2y = p.y - a.y;

        const dot00 = v0x * v0x + v0y * v0y;
        const dot01 = v0x * v1x + v0y * v1y;
        const dot02 = v0x * v2x + v0y * v2y;
        const dot11 = v1x * v1x + v1y * v1y;
        const dot12 = v1x * v2x + v1y * v2y;

        const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

        return u >= 0 && v >= 0 && u + v < 1;
    }

    rotate(angle: number, origin?: Point | undefined): this {
        const o = origin ?? this.center();
        const rotator = o.as_center(angle);
        return this.map_points(rotator);
    }

    center(): Point {
        return new Point(
            (this.a.x + this.b.x + this.c.x) / 3,
            (this.a.y + this.b.y + this.c.y) / 3
        );
    }

    lines(): LineSegment[] {
        return cyclic_pairs(this.vertices()).map(
            ([a, b]) => new LineSegment(a, b)
        );
    }

    outline_intersects(other: TriangleSolid): boolean {
        return this.lines().some((l) =>
            other.lines().some((l2) => l.outline_intersects(l2))
        );
    }

    intersects(other: TriangleSolid): boolean {
        return (
            this.contains(other.a) ||
            this.contains(other.b) ||
            this.contains(other.c) ||
            this.outline_intersects(other)
        );
    }

    relation_to(
        other: TriangleSolid
    ):
        | "this_inside_other"
        | "other_inside_this"
        | "outline_intersect"
        | "disjoint" {
        if (
            this.contains(other.a) &&
            this.contains(other.b) &&
            this.contains(other.c)
        ) {
            return "this_inside_other";
        }
        if (
            other.contains(this.a) &&
            other.contains(this.b) &&
            other.contains(this.c)
        ) {
            return "other_inside_this";
        }
        if (this.outline_intersects(other)) {
            return "outline_intersect";
        }
        return "disjoint";
    }

    recenter(axis: Axis): this {
        const offset = this.center().to_axis(axis).negate();
        return this.translate(offset);
    }

    right_point_intersections(p: Point): number {
        const lines = cyclic_pairs(this.vertices()).map(
            ([a, b]) => new LineSegment(a, b)
        );
        return lines.reduce(
            (acc, l) => acc + l.right_point_intersections(p),
            0
        );
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.a.x, this.a.y);
        ctx.lineTo(this.b.x, this.b.y);
        ctx.lineTo(this.c.x, this.c.y);
        ctx.lineTo(this.a.x, this.a.y);
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
            this.vertices().map((p) => p.to_circle_solid(2).render_debug(ctx));
        });
    }
}
