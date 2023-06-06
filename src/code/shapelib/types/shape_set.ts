import { sum } from "lodash-es";
import type { Axis, Shape } from "./interfaces";
import { RectSolid } from "./rect_solid";
import { Point } from "./point";
import { zip } from "functional-utilities";
import type { TriangleSolid } from "./triangle_solid";
import { create_collider } from "../funcs/create_collider";

export class ShapeSet<T extends Shape> implements Shape {
    shapes: T[];
    private cache: {
        collider?: (p: Point) => boolean;
    } = {}

    constructor(shapes: T[]) {
        this.shapes = shapes;
    }

    area(): number {
        return sum(this.shapes.map((s) => s.area()));
    }

    bbox(): RectSolid {
        return RectSolid.union(this.shapes.map((s) => s.bbox()));
    }

    contains(p: Point, quality: number): boolean {
        const collider = this.cache.collider ?? create_collider<T, Point>(this.shapes, (s1, s2) => s1.contains(s2, quality));
        this.cache.collider = collider;
        return collider(p);
    }

    flip(axis: Axis): this {
        const bboxes = this.shapes.map((s) => s.bbox());
        const center = RectSolid.union(bboxes).center();

        // Flip each shape.
        const flippedShapes = this.shapes.map((s) => s.flip(axis));

        // Translate each shape to its new position.
        const translatedShapes = zip([flippedShapes, bboxes] as [
            T[],
            RectSolid[]
        ]).map(([s, b]) => {
            // calculate the translation vector for both axis
            const vec = b.center().translate(center.factor(-1));
            const axis_vec = new Point(
                axis !== "y" ? vec.x : 0,
                axis !== "x" ? vec.y : 0
            );
            return s.translate(axis_vec);
        });

        return new ShapeSet(translatedShapes) as this;
    }

    translate(offset: Point): this {
        return new ShapeSet(this.shapes.map((s) => s.translate(offset))) as this;
    }

    outline_intersects(other: ShapeSet<T>): boolean {
        return this.shapes.some((s) =>
            other.shapes.some((o) => s.outline_intersects(o))
        );
    }

    outline_length(): number {
        return sum(this.shapes.map((s) => s.outline_length()));
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        this.shapes.forEach((s) => s.render_debug(ctx));
    }

    render_fill(ctx: CanvasRenderingContext2D): void {
        this.shapes.forEach((s) => s.render_fill(ctx));
    }

    render_outline(ctx: CanvasRenderingContext2D): void {
        this.shapes.forEach((s) => s.render_outline(ctx));
    }

    right_point_intersections(p: Point): number {
        return sum(this.shapes.map((s) => s.right_point_intersections(p)));
    }

    sample_on_area(min_per_unit: number, variant: "min" | "rng"): Point[] {
        return this.shapes.flatMap((s) =>
            s.sample_on_area(min_per_unit, variant)
        );
    }

    sample_on_length(min_per_unit: number, variant: "rng" | "evenly"): Point[] {
        return this.shapes.flatMap((s) =>
            s.sample_on_length(min_per_unit, variant)
        );
    }

    scale(scale: number, offset?: Point | undefined): this {
        return new ShapeSet(this.shapes.map((s) => s.scale(scale, offset))) as this;
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        this.shapes.forEach((s) => s.select_shape(ctx));
    }

    toString(): string {
        return this.shapes.map((s) => s.toString()).join(" + ");
    }

    triangulate(quality: number): ShapeSet<TriangleSolid> {
        return ShapeSet.union(this.shapes.map((s) => s.triangulate(quality)));
    }

    static union<T extends Shape>(sets: ShapeSet<T>[]): ShapeSet<T> {
        return new ShapeSet(sets.flatMap((s) => s.shapes));
    }

    map_shapes<U extends Shape>(f: (s: T) => U): ShapeSet<U> {
        return new ShapeSet(this.shapes.map(f));
    }

    map_arr<U>(f: (s: T) => U): U[] {
        return this.shapes.map(f);
    }

    map_base<U extends Shape>(
        f: (s: UnwrapSet<T>) => U
    ): MapContained<ShapeSet<T>, U> {
        return this.map_shapes((v) => {
            if (v instanceof ShapeSet) {
                return v.map_base(f);
            } else {
                return f(v as UnwrapSet<T>);
            }
        }) as MapContained<ShapeSet<T>, U>;
    }

    recenter(axis: Axis): this {
        const offset = this.center().to_axis(axis).negate();
        return this.translate(offset) as this;
    }

    center(): Point {
        return this.bbox().center();
    }

    rotate(angle: number, origin?: Point): this {
        const o = origin ?? this.center();
        return new ShapeSet(this.shapes.map((s) => s.rotate(angle, o))) as this;
    }
}

type UnwrapSet<T> = T extends ShapeSet<infer U> ? UnwrapSet<U> : T;

type MapContained<T, U extends Shape> = T extends ShapeSet<infer V>
    ? ShapeSet<MapContained<V, U>>
    : U;
