import { Interpolate } from "~/code/funcs/interpolator";
import type { Axis, PointMap, Stringifiable } from "./interfaces";
import { Point } from "./point";

export class PartialBezier implements Stringifiable, PointMap, Interpolate {
    handle1: Point;
    handle2: Point;
    end_point: Point;

    constructor(handle1: Point, handle2: Point, end_point: Point) {
        this.handle1 = handle1;
        this.handle2 = handle2;
        this.end_point = end_point;
    }

    toString(): string {
        return `BezierSegment(h1=${this.handle1.toString()}, h2=${this.handle2.toString()}, ep=${this.end_point.toString()})`;
    }

    translate(p: Point): PartialBezier {
        return new PartialBezier(
            this.handle1.translate(p),
            this.handle2.translate(p),
            this.end_point.translate(p)
        );
    }

    is_this(value: unknown): value is this {
        return value instanceof PartialBezier;
    }

    similarity(to: this): number {
        return this.handle1.similarity(to.handle1) +
            this.handle2.similarity(to.handle2) +
            this.end_point.similarity(to.end_point);
    }

    interpolate(t: number, to: this): this {
        return new PartialBezier(
            this.handle1.interpolate(t, to.handle1),
            this.handle2.interpolate(t, to.handle2),
            this.end_point.interpolate(t, to.end_point)
        ) as this;
    }

    to_start(): this {
        return this;
    }

    scale(scale: number, origin = new Point(0, 0)): PartialBezier {
        return new PartialBezier(
            this.handle1.scale(scale, origin),
            this.handle2.scale(scale, origin),
            this.end_point.scale(scale, origin)
        );
    }

    flip(axis: Axis): PartialBezier {
        return new PartialBezier(
            this.handle1.flip(axis),
            this.handle2.flip(axis),
            this.end_point.flip(axis)
        );
    }

    map_points(f: (p: Point) => Point): this {
        return new PartialBezier(
            f(this.handle1),
            f(this.handle2),
            f(this.end_point)
        ) as this;
    }
}
