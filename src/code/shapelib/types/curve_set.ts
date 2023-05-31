import { sum } from "lodash-es";
import { RectSolid } from "./rect_solid";
import { Point } from "./point";
import { zip } from "functional-utilities";
import type { Axis, Curve } from "./interfaces";

export class CurveSet<T extends Curve> {
    curves: T[];

    constructor(shapes: T[]) {
        this.curves = shapes;
    }

    bbox(): RectSolid {
        return RectSolid.union(this.curves.map((s) => s.bbox()));
    }

    flip(axis: Axis): CurveSet<T> {
        const bboxes = this.curves.map((s) => s.bbox());
        const center = RectSolid.union(bboxes).center();

        // Flip each shape.
        const flippedShapes = this.curves.map((s) => s.flip(axis));

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

        return new CurveSet(translatedShapes);
    }

    translate(offset: Point): CurveSet<T> {
        return new CurveSet(this.curves.map((s) => s.translate(offset)));
    }

    outline_intersects(other: CurveSet<T>): boolean {
        return this.curves.some((s) =>
            other.curves.some((o) => s.outline_intersects(o))
        );
    }

    outline_length(): number {
        return sum(this.curves.map((s) => s.outline_length()));
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        this.curves.forEach((s) => s.render_debug(ctx));
    }

    render_outline(ctx: CanvasRenderingContext2D): void {
        this.curves.forEach((s) => s.render_outline(ctx));
    }

    right_point_intersections(p: Point): number {
        return sum(this.curves.map((s) => s.right_point_intersections(p)));
    }

    sample_on_length(min_per_unit: number, variant: "rng" | "evenly"): Point[] {
        return this.curves.flatMap((s) =>
            s.sample_on_length(min_per_unit, variant)
        );
    }

    scale(scale: number, offset?: Point | undefined): CurveSet<T> {
        return new CurveSet(this.curves.map((s) => s.scale(scale, offset)));
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        this.curves.forEach((s) => s.select_shape(ctx));
    }

    toString(): string {
        return this.curves.map((s) => s.toString()).join(" + ");
    }

    static union<T extends Curve>(sets: CurveSet<T>[]): CurveSet<T> {
        return new CurveSet(sets.flatMap((s) => s.curves));
    }

    map_lines<U extends Curve>(f: (s: T) => U): CurveSet<U> {
        return new CurveSet(this.curves.map(f));
    }

    map_arr<U>(f: (s: T) => U): U[] {
        return this.curves.map(f);
    }

    map_base<U extends Curve>(
        f: (s: UnwrapSet<T>) => U
    ): MapContained<CurveSet<T>, U> {
        return this.map_lines((v) => {
            if (v instanceof CurveSet) {
                return v.map_base(f);
            } else {
                return f(v as UnwrapSet<T>);
            }
        }) as MapContained<CurveSet<T>, U>;
    }

    recenter(axis: Axis): CurveSet<T> {
        const offset = this.center().to_axis(axis).negate();
        return this.translate(offset);
    }

    center(): Point {
        return this.bbox().center();
    }

    rotate(angle: number, origin?: Point): CurveSet<T> {
        const o = origin ?? this.center();
        return new CurveSet(this.curves.map((s) => s.rotate(angle, o)));
    }

    map<U>(f: (s: T) => U): U[] {
        return this.curves.map(f);
    }

    reduce<U>(f: (acc: U, s: T) => U, init: U): U {
        return this.curves.reduce(f, init);
    }

    filter(f: (s: T) => boolean): CurveSet<T> {
        return new CurveSet(this.curves.filter(f));
    }

    some(f: (s: T) => boolean): boolean {
        return this.curves.some(f);
    }

    every(f: (s: T) => boolean): boolean {
        return this.curves.every(f);
    }
}

type UnwrapSet<T> = T extends CurveSet<infer U> ? UnwrapSet<U> : T;

type MapContained<T, U extends Curve> = T extends CurveSet<infer V>
    ? CurveSet<MapContained<V, U>>
    : U;
