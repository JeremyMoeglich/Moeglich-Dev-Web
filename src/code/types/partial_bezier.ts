import type { Axis, PointMap, Stringifiable, Transformable } from "./interfaces";
import type { Point } from "./point";


export class PartialBezier implements Stringifiable, Transformable<PartialBezier>, PointMap<PartialBezier> {
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

    offset(p: Point): PartialBezier {
        return new PartialBezier(this.handle1.offset(p), this.handle2.offset(p), this.end_point.offset(p));
    }

    scale(scale: number, offset?: Point): PartialBezier {
        return new PartialBezier(
            this.handle1.scale(scale, offset),
            this.handle2.scale(scale, offset),
            this.end_point.scale(scale, offset)
        );
    }

    flip(axis: Axis): PartialBezier {
        return new PartialBezier(
            this.handle1.flip(axis),
            this.handle2.flip(axis),
            this.end_point.flip(axis)
        );
    }

    map_points(f: (p: Point) => Point): PartialBezier {
        return new PartialBezier(f(this.handle1), f(this.handle2), f(this.end_point));
    }
}