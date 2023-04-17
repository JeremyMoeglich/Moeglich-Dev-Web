import { cyclic_pairs, panic } from "functional-utilities";
import type { Axis, HasVertices, PointMap, SolidShape } from "./interfaces";
import { LineSegment } from "./line_segment";
import type { Point } from "./point";
import { RectSolid } from "./rect_solid";
import { TriangleSolid } from "./triangle_solid";
import { chunk, sum } from "lodash-es";
import earcut from "earcut";
import { create_collider } from "../funcs/create_collider";
import { create_range_collider } from "../funcs/create_range_collider";
import { debug_context } from "../funcs/render_debug";

export class PolygonSolid implements SolidShape<PolygonSolid>, PointMap<PolygonSolid>, HasVertices {
    points: Point[];
    private cache: {
        bbox?: RectSolid;
        triangulation?: TriangleSolid[];
        area_collider?: (p: Point) => boolean;
        outline_collider?: (l: LineSegment) => boolean;
        right_point_counter?: (p: Point) => number;
        area?: number;
        length?: number;
    } = {};

    constructor(points: Point[]) {
        this.points = points;
    }

    invalidate() {
        this.cache = {};
    }

    toString(): string {
        return `PolygonSolid(${this.points.map(p => p.toString()).join(', ')})`;
    }

    offset(p: Point): PolygonSolid {
        return new PolygonSolid(this.points.map(p2 => p2.offset(p)));
    }

    scale(scale: number, offset?: Point): PolygonSolid {
        return new PolygonSolid(this.points.map(p => p.scale(scale, offset)));
    }

    flip(axis: Axis): PolygonSolid {
        return new PolygonSolid(this.points.map(p => p.flip(axis)));
    }

    map_points(f: (p: Point) => Point): PolygonSolid {
        return new PolygonSolid(this.points.map(f));
    }

    bbox(): RectSolid {
        if (this.cache.bbox) return this.cache.bbox;
        const xv = this.points.map(p => p.x);
        const yv = this.points.map(p => p.y);

        const mx = Math.min(...xv);
        const my = Math.min(...yv);
        const Mx = Math.max(...xv);
        const My = Math.max(...yv);

        const rect = new RectSolid(mx, my, Mx - mx, My - my);
        this.cache.bbox = rect;
        return rect;
    }

    approximated(): PolygonSolid {
        return this;
    }

    area(): number {
        if (this.cache.area) return this.cache.area;
        const area = Math.abs(
            cyclic_pairs(this.points)
                .map(([curr, next]) => curr.x * next.y - curr.y * next.x)
                .reduce((a, b) => a + b, 0) / 2
        );
        this.cache.area = area;
        return area;
    }

    triangulate(): TriangleSolid[] {
        if (this.cache.triangulation) return this.cache.triangulation;
        const triangles = chunk(earcut(this.points.flatMap(p => [p.x, p.y])).map(i => this.points[i] ?? panic('Invalid earcut index')), 3).map(
            ([a, b, c]) => new TriangleSolid(
                a ?? panic('Invalid earcut output length'),
                b ?? panic('Invalid earcut output length'),
                c ?? panic('Invalid earcut output length')
            )
        );
        this.cache.triangulation = triangles;
        return triangles;
    }

    sample_on_area(avr_per_unit: number, variant: 'min' | 'rng'): Point[] {
        const triangles = this.triangulate();
        return triangles.flatMap(t => t.sample_on_area(avr_per_unit, variant));
    }

    vertices(): Point[] {
        return this.points;
    }

    contains(p: Point): boolean {
        const right_point_intersection_count = this.right_point_intersections(p);
        return right_point_intersection_count % 2 === 1;
    }

    outline_length(): number {
        if (this.cache.length) return this.cache.length;
        const length = cyclic_pairs(this.points).map(([a, b]) => a.distance(b)).reduce((a, b) => a + b, 0);
        this.cache.length = length;
        return length;
    }

    sample_on_length(min_per_unit: number, variant: "rng" | "evenly"): Point[] {
        return this.lines().flatMap(l => l.sample_on_length(min_per_unit, variant));
    }

    lines(): LineSegment[] {
        return cyclic_pairs(this.points).map(([a, b]) => new LineSegment(a, b));
    }

    outline_intersects(other: PolygonSolid): boolean {
        const lines = this.lines();
        if (this.cache.outline_collider) return lines.some(l => (this.cache.outline_collider ?? panic())(l));
        const collider = create_collider<LineSegment, LineSegment>(this.lines(), (l, o) => l.outline_intersects(o));
        this.cache.outline_collider = collider;
        return other.lines().some(l => collider(l));
    }

    intersects(other: PolygonSolid): boolean {
        if (other.points.length === 0) return false;
        return this.outline_intersects(other) ||
            this.contains(other.points[0] ?? panic('Invalid polygon (Internal)')) ||
            other.contains(this.points[0] ?? panic('Invalid polygon (Internal)'));
    }

    relation_to(other: PolygonSolid): "this_inside_other" | "other_inside_this" | "outline_intersect" | "disjoint" {
        if (this.outline_intersects(other)) return "outline_intersect";
        if (this.contains(other.points[0] ?? panic('Invalid polygon (Internal)'))) return "this_inside_other";
        if (other.contains(this.points[0] ?? panic('Invalid polygon (Internal)'))) return "other_inside_this";
        return "disjoint";
    }

    right_point_intersections(p: Point): number {
        if (this.cache.right_point_counter) return this.cache.right_point_counter(p);
        const collider = create_range_collider<LineSegment, Point>(
            this.lines(),
            (l) => [l.min_y(), l.max_y()],
            (p) => [p.y, p.y]
        );
        const counter = (p: Point) => {
            const lines = collider(p);
            return sum(lines.map(l => l.right_point_intersections(p)));
        }
        this.cache.right_point_counter = counter;
        return counter(p);
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        if (this.points.length === 0) return;
        const p0 = this.points[0] ?? panic('Invalid polygon (Internal)');
        ctx.moveTo(p0.x, p0.y);
        const loop_points = this.points.slice(1);
        loop_points.push(p0);
        for (const p of loop_points) {
            ctx.lineTo(p.x, p.y);
        }
    }

    render_outline(ctx: CanvasRenderingContext2D): void {
        if (this.points.length === 0) return;
        ctx.beginPath();
        this.select_shape(ctx);
        ctx.stroke();
    }

    render_fill(ctx: CanvasRenderingContext2D): void {
        if (this.points.length === 0) return;
        ctx.beginPath();
        this.select_shape(ctx);
        ctx.fill();
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        if (this.points.length === 0) return;
        debug_context(ctx, (ctx) => {
            this.points.map(p => p.to_circle_solid(2).render_fill(ctx));
            // mark [0] as red
            ctx.fillStyle = "red";
            (this.points[0] ?? panic()).to_circle_solid(4).render_fill(ctx);
        });
    }
}