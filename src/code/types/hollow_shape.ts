import { chunk } from "lodash-es";
import type { Axis, Shape, SolidShape } from "./interfaces";
import type { Point } from "./point";
import type { PolygonSolid } from "./polygon_solid";
import type { RectSolid } from "./rect_solid";
import { TriangleSolid } from "./triangle_solid";
import { panic } from "functional-utilities";
import earcut from "earcut";



export class HollowShape<T extends SolidShape<T>> implements Shape<HollowShape<T>> {
    exterior: T;
    holes: T[];

    private cache: {
        area?: number;
        triangulation?: TriangleSolid[];
        approximation?: HollowShape<PolygonSolid>;
    } = {};

    constructor(exterior: T, holes: T[]) {
        this.exterior = exterior;
        this.holes = holes;
    }

    toString(): string {
        return `HollowShape(${this.exterior.toString()}, ${this.holes.map(h => h.toString()).join(', ')})`;
    }

    offset(p: Point): HollowShape<T> {
        return new HollowShape(this.exterior.offset(p), this.holes.map(h => h.offset(p)));
    }

    scale(scale: number, offset?: Point): HollowShape<T> {
        return new HollowShape(this.exterior.scale(scale, offset), this.holes.map(h => h.scale(scale, offset)));
    }

    flip(axis: Axis): HollowShape<T> {
        return new HollowShape(this.exterior.flip(axis), this.holes.map(h => h.flip(axis)));
    }

    bbox(): RectSolid {
        return this.exterior.bbox();
    }

    area(): number {
        return this.exterior.area() - this.holes.reduce((acc, h) => acc + h.area(), 0);
    }

    sample_on_area(min_per_unit: number, variant: "min" | "rng"): Point[] {
        // TODO do exact sampling
        return this.approximated(1).sample_on_area(min_per_unit, variant);
    }

    triangulate(quality: number): TriangleSolid[] {
        if (this.cache.triangulation) return this.cache.triangulation;
        const points = this.exterior.approximated(quality).points;
        const earcut_input = points.flatMap(p => [p.x, p.y]);
        const hole_indices = [];
        for (const hole of this.holes) {
            hole_indices.push(earcut_input.length / 2);
            const hole_points = hole.approximated(quality).points;
            earcut_input.push(...hole_points.flatMap(p => [p.x, p.y]));
            points.push(...hole_points);
        }

        const triangles = chunk(earcut(earcut_input, hole_indices).map(i => points[i] ?? panic('Invalid earcut index')), 3).map(
            ([a, b, c]) => new TriangleSolid(
                a ?? panic('Invalid earcut output length'),
                b ?? panic('Invalid earcut output length'),
                c ?? panic('Invalid earcut output length')
            )
        );
        this.cache.triangulation = triangles;
        return triangles;
    }

    contains(p: Point): boolean {
        return this.right_point_intersections(p) % 2 === 1;
    }

    approximated(quality: number): HollowShape<PolygonSolid> {
        if (this.cache.approximation) return this.cache.approximation;
        const approximation = new HollowShape<PolygonSolid>(this.exterior.approximated(quality), this.holes.map(h => h.approximated(quality)));
        this.cache.approximation = approximation;
        return approximation;
    }

    push_hole(hole: T): void {
        this.holes.push(hole);
        this.cache = {};
    }

    replace_exterior(exterior: T): void {
        this.exterior = exterior;
        this.cache = {};
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        this.exterior.select_shape(ctx);
        this.holes.forEach(h => h.select_shape(ctx));
    }

    render_outline(ctx: CanvasRenderingContext2D): void {
        this.exterior.render_outline(ctx);
        this.holes.forEach(h => h.render_outline(ctx));
    }

    render_fill(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        this.select_shape(ctx);
        (ctx as unknown as { mozFillRule: string }).mozFillRule = 'evenodd'; // For old Firefox versions
        ctx.fill('evenodd');
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        this.exterior.render_debug(ctx);
        this.holes.forEach(h => h.render_debug(ctx));
    }

    map_points(this: HollowShape<PolygonSolid>, f: (p: Point) => Point): HollowShape<PolygonSolid> {
        return new HollowShape(this.exterior.map_points(f), this.holes.map(h => h.map_points(f)));
    }

    outline_intersects(other: HollowShape<T>): boolean {
        return this.exterior.outline_intersects(other.exterior) || this.holes.some(h => other.exterior.outline_intersects(h));
    }

    outline_length(): number {
        return this.exterior.outline_length() + this.holes.reduce((acc, h) => acc + h.outline_length(), 0);
    }

    right_point_intersections(p: Point): number {
        return this.exterior.right_point_intersections(p) + this.holes.reduce((acc, h) => acc + h.right_point_intersections(p), 0);
    }

    sample_on_length(min_per_unit: number, variant: "rng" | "evenly"): Point[] {
        return this.exterior.sample_on_length(min_per_unit, variant).concat(...this.holes.map(h => h.sample_on_length(min_per_unit, variant)));
    }
}