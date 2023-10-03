import type { Interpolate } from "~/code/funcs/interpolator";
import type { Axis } from "./types";
import { type Point, zerozero } from "./point";
import { v4 } from "uuid";
import type { Stringifiable } from "./interfaces/stringifiable";
import type { PointMap } from "./interfaces/pointmap";
import { type ThisReturn } from "~/code/bundle";

export class PartialBezier implements Stringifiable, PointMap, Interpolate {
    handle1: Point;
    handle2: Point;
    end_point: Point;

    private cache: {
        id?: string;
    } = {};

    constructor(handle1: Point, handle2: Point, end_point: Point) {
        this.handle1 = handle1;
        this.handle2 = handle2;
        this.end_point = end_point;
    }

    static empty(): PartialBezier {
        return new PartialBezier(zerozero, zerozero, zerozero);
    }

    to_string(): string {
        return `BezierSegment(h1=${this.handle1.to_string()}, h2=${this.handle2.to_string()}, ep=${this.end_point.to_string()})`;
    }

    translate(p: Point): PartialBezier {
        return new PartialBezier(
            this.handle1.translate(p),
            this.handle2.translate(p),
            this.end_point.translate(p)
        );
    }

    can_interpolate(value: unknown): value is this {
        return value instanceof PartialBezier;
    }

    similarity(to: this): number {
        return (
            this.handle1.similarity(to.handle1) +
            this.handle2.similarity(to.handle2) +
            this.end_point.similarity(to.end_point)
        );
    }

    interpolate(t: number, to: this) {
        return new PartialBezier(
            this.handle1.interpolate(t, to.handle1),
            this.handle2.interpolate(t, to.handle2),
            this.end_point.interpolate(t, to.end_point)
        ) as this & ThisReturn;
    }

    id(): string {
        if (this.cache.id) return this.cache.id;
        const id = v4();
        this.cache.id = id;
        return id;
    }

    to_start() {
        return this as this & ThisReturn;
    }

    scale(scale: number | Point, origin = zerozero): PartialBezier {
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

    map_points(f: (p: Point) => Point) {
        return new PartialBezier(
            f(this.handle1),
            f(this.handle2),
            f(this.end_point)
        ) as this & ThisReturn;
    }
}
