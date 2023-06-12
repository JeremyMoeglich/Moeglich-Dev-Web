import { chunk, sum } from "lodash-es";
import type { Axis } from "./types";
import type { Point } from "./point";
import type { PolygonSolid } from "./polygon_solid";
import { type RectSolid } from "./rect_solid";
import { TriangleSolid } from "./triangle_solid";
import { panic } from "functional-utilities";
import earcut from "earcut";
import { v4 } from "uuid";
import type { Interpolate } from "~/code/funcs/interpolator";
import type { SolidShape } from "./interfaces/solidshape";
import type { Shape } from "./interfaces/shape";
import { unmark_this, type ThisReturn } from "~/code/bundle";
import { shapeaction } from "~/code/funcs/shapeact";

export class HollowShape<T extends SolidShape & Interpolate>
    implements Shape, Interpolate
{
    exterior: T;
    holes: T[];

    private cache: {
        area?: number;
        triangulation?: TriangleSolid[];
        approximation?: HollowShape<PolygonSolid>;
        id?: string;
    } = {};

    constructor(
        exterior: T,
        holes: T[],
        public ctx_setter?: (ctx: CanvasRenderingContext2D) => void
    ) {
        this.exterior = exterior;
        this.holes = holes;
    }

    static empty<T extends SolidShape & Interpolate>(exterior: T) {
        return new HollowShape(exterior, []);
    }

    id(): string {
        if (this.cache.id) return this.cache.id;
        const id = v4();
        this.cache.id = id;
        return id;
    }

    can_interpolate(value: unknown): value is this {
        return value instanceof HollowShape && this.exterior.can_interpolate(value.exterior);
    }

    similarity(to: this): number {
        return (
            this.exterior.similarity(to.exterior) +
            sum(this.holes.map((h) => h.similarity(to.exterior)))
        );
    }

    to_start() {
        return this.scale(0);
    }

    interpolate(t: number, to: this): this & ThisReturn {
        return new HollowShape(
            unmark_this(this.exterior.interpolate(t, to.exterior)),
            this.holes.map((h) => h.interpolate(t, to.exterior)),
            this.ctx_setter
        ) as this & ThisReturn;
    }

    toString(): string {
        return `HollowShape(${this.exterior.toString()}, ${this.holes
            .map((h) => h.toString())
            .join(", ")})`;
    }

    all_shapes(): T[] {
        return [this.exterior, ...this.holes];
    }

    translate(p: Point): this & ThisReturn {
        return new HollowShape(
            this.exterior.translate(p) as T,
            this.holes.map((h) => h.translate(p)),
            this.ctx_setter
        ) as this & ThisReturn;
    }

    scale(scale: number | Point, offset?: Point): this & ThisReturn {
        return new HollowShape(
            this.exterior.scale(scale, offset) as T,
            this.holes.map((h) => h.scale(scale, offset)),
            this.ctx_setter
        ) as this & ThisReturn;
    }

    flip(axis: Axis): this & ThisReturn {
        return new HollowShape(
            this.exterior.flip(axis) as T,
            this.holes.map((h) => h.flip(axis)),
            this.ctx_setter
        ) as this & ThisReturn;
    }

    bbox(): RectSolid {
        return this.exterior.bbox();
    }

    area(): number {
        return (
            this.exterior.area() -
            this.holes.reduce((acc, h) => acc + h.area(), 0)
        );
    }

    sample_on_area(min_per_unit: number, variant: "min" | "rng"): Point[] {
        // TODO do exact sampling
        return this.approximated(1).sample_on_area(min_per_unit, variant);
    }

    recenter(axis: Axis) {
        const offset = this.center().to_axis(axis).negate();
        return this.translate(offset);
    }

    triangulate(quality: number): TriangleSolid[] {
        if (this.cache.triangulation) return this.cache.triangulation;
        const points = this.exterior.approximated(quality).points;
        const earcut_input = points.flatMap((p) => [p.x, p.y]);
        const hole_indices = [];
        for (const hole of this.holes) {
            hole_indices.push(earcut_input.length / 2);
            const hole_points = hole.approximated(quality).points;
            earcut_input.push(...hole_points.flatMap((p) => [p.x, p.y]));
            points.push(...hole_points);
        }

        const triangles = chunk(
            earcut(earcut_input, hole_indices).map(
                (i) => points[i] ?? panic("Invalid earcut index")
            ),
            3
        ).map(
            ([a, b, c]) =>
                new TriangleSolid(
                    a ?? panic("Invalid earcut output length"),
                    b ?? panic("Invalid earcut output length"),
                    c ?? panic("Invalid earcut output length")
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
        const approximation = new HollowShape<PolygonSolid>(
            this.exterior.approximated(quality),
            this.holes.map((h) => h.approximated(quality)),
            this.ctx_setter
        );
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
        this.holes.forEach((h) => h.select_shape(ctx));
    }

    render(ctx: CanvasRenderingContext2D, action: 'fill' | 'stroke'): void {
        this.ctx_setter && this.ctx_setter(ctx);
        ctx.beginPath();
        this.select_shape(ctx);
        shapeaction(ctx, action);
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        this.exterior.render_debug(ctx);
        this.holes.forEach((h) => h.render_debug(ctx));
    }

    map_points(
        this: HollowShape<PolygonSolid>,
        f: (p: Point) => Point
    ): this & ThisReturn {
        return new HollowShape(
            this.exterior.map_points(f),
            this.holes.map((h) => h.map_points(f)),
            this.ctx_setter
        ) as unknown as this & ThisReturn;
    }

    outline_intersects(other: this): boolean {
        return (
            this.exterior.outline_intersects(other.exterior) ||
            this.holes.some((h) => other.exterior.outline_intersects(h))
        );
    }

    outline_length(): number {
        return (
            this.exterior.outline_length() +
            this.holes.reduce((acc, h) => acc + h.outline_length(), 0)
        );
    }

    right_point_intersections(p: Point): number {
        return (
            this.exterior.right_point_intersections(p) +
            this.holes.reduce(
                (acc, h) => acc + h.right_point_intersections(p),
                0
            )
        );
    }

    sample_on_length(min_per_unit: number, variant: "rng" | "evenly"): Point[] {
        return this.exterior
            .sample_on_length(min_per_unit, variant)
            .concat(
                ...this.holes.map((h) =>
                    h.sample_on_length(min_per_unit, variant)
                )
            );
    }

    center(): Point {
        return this.exterior.center();
    }

    rotate(angle: number, origin?: Point | undefined): this & ThisReturn {
        const o = origin ?? this.center();
        return new HollowShape(
            this.exterior.rotate(angle, o) as T,
            this.holes.map((h) => h.rotate(angle, o)),
            this.ctx_setter
        ) as this & ThisReturn;
    }

    set_setter(ctx_setter: (ctx: CanvasRenderingContext2D) => void) {
        this.ctx_setter = ctx_setter;
        return this as this & ThisReturn;
    }
}
