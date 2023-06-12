import { cyclic_pairs } from "functional-utilities";
import { sample_amount_default } from "../funcs/sample_amount";
import type { Axis } from "./types";
import { Point, zerozero } from "./point";
import { PolygonSolid } from "./polygon_solid";
import { RectSolid } from "./rect_solid";
import { LineSegment } from "./line_segment";
import { debug_context } from "../funcs/render_debug";
import { type Interpolate } from "~/code/funcs/interpolator";
import { v4 } from "uuid";
import { type SolidShape } from "./interfaces/solidshape";
import { type PointMap } from "./interfaces/pointmap";
import { type ThisReturn } from "~/code/bundle";
import { shapeaction } from "~/code/funcs/shapeact";
import { Renderable } from "./interfaces/renderable";

export class TriangleSolid implements SolidShape, PointMap, Interpolate {
    private cache: {
        id?: string;
    } = {};

    id(): string {
        if (this.cache.id) return this.cache.id;
        const id = v4();
        this.cache.id = id;
        return id;
    }

    a: Point;
    b: Point;
    c: Point;

    constructor(
        a: Point,
        b: Point,
        c: Point,
        public ctx_setter?: (ctx: CanvasRenderingContext2D) => void
    ) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    static empty(): TriangleSolid {
        return new TriangleSolid(zerozero, zerozero, zerozero);
    }

    toString(): string {
        return `TriangleSolid(${this.a.toString()}, ${this.b.toString()}, ${this.c.toString()})`;
    }

    interpolate(t: number, to: this) {
        return new TriangleSolid(
            this.a.interpolate(t, to.a),
            this.b.interpolate(t, to.b),
            this.c.interpolate(t, to.c),
            this.ctx_setter
        ) as this & ThisReturn;
    }

    to_start() {
        const center = this.center();
        return new TriangleSolid(
            center,
            center,
            center,
            this.ctx_setter
        ) as this & ThisReturn;
    }

    can_interpolate(value: unknown): value is this {
        return value instanceof TriangleSolid;
    }

    similarity(to: this): number {
        const a = this.a.similarity(to.a);
        const b = this.b.similarity(to.b);
        const c = this.c.similarity(to.c);
        return a + b + c;
    }

    translate(p: Point) {
        return new TriangleSolid(
            this.a.translate(p),
            this.b.translate(p),
            this.c.translate(p),
            this.ctx_setter
        ) as this & ThisReturn;
    }

    scale(scale: number | Point, origin = zerozero) {
        return new TriangleSolid(
            this.a.scale(scale, origin),
            this.b.scale(scale, origin),
            this.c.scale(scale, origin),
            this.ctx_setter
        ) as this & ThisReturn;
    }

    flip(axis: Axis) {
        return new TriangleSolid(
            this.a.flip(axis),
            this.b.flip(axis),
            this.c.flip(axis),
            this.ctx_setter
        ) as this & ThisReturn;
    }

    map_points(f: (p: Point) => Point) {
        return new TriangleSolid(
            f(this.a),
            f(this.b),
            f(this.c),
            this.ctx_setter
        ) as this & ThisReturn;
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

    triangulate(): TriangleSolid[] {
        return [this];
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

    rotate(angle: number, origin?: Point | undefined) {
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

    outline_intersects(other: this): boolean {
        return this.lines().some((l) =>
            other.lines().some((l2) => l.outline_intersects(l2))
        );
    }

    intersects(other: this): boolean {
        return (
            this.contains(other.a) ||
            this.contains(other.b) ||
            this.contains(other.c) ||
            this.outline_intersects(other)
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

    recenter(axis: Axis) {
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

    render(ctx: CanvasRenderingContext2D, action: "fill" | "stroke"): void {
        this.ctx_setter && this.ctx_setter(ctx);
        ctx.beginPath();
        this.select_shape(ctx);
        shapeaction(ctx, action);
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        debug_context(ctx, (ctx) => {
            this.vertices().map((p) => p.to_circle_solid(2).render_debug(ctx));
        });
    }

    set_setter(ctx_setter: (ctx: CanvasRenderingContext2D) => void) {
        this.ctx_setter = ctx_setter;
        return this as this & ThisReturn;
    }
}
