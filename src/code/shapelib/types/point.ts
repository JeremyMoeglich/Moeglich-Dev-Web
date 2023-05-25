import { panic } from "functional-utilities";
import { debug_context } from "../funcs/render_debug";
import { CircleSolid } from "./circle_solid";
import type {
    Axis,
    BoundingBox,
    PointMap,
    RenderableDebug,
    Stringifiable,
    Transformable,
} from "./interfaces";
import { LineSegment } from "./line_segment";
import { RectSolid } from "./rect_solid";
import type { Interpolate } from "~/code/funcs/interpolator";

export class Point
    implements
    Stringifiable,
    Transformable<Point>,
    PointMap<Point>,
    BoundingBox,
    RenderableDebug,
    Interpolate {
    x: number;
    y: number;

    private cache: {
        rotator: Map<number, (p: Point) => Point>;
    } = { rotator: new Map() };

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toString(): string {
        return `Point(${this.x}, ${this.y})`;
    }

    as_center(angle: number): (p: Point) => Point {
        const cosTheta = Math.cos(angle);
        const sinTheta = Math.sin(angle);

        if (this.cache.rotator.has(angle)) {
            return (
                this.cache.rotator.get(angle) ??
                panic("rotator map has angle but somehow undefined")
            );
        }
        const func = (point: Point): Point => {
            // Translate the point relative to the origin
            const translatedX = point.x - this.x;
            const translatedY = point.y - this.y;

            // Perform rotation using precalculated matrix
            const rotatedX = translatedX * cosTheta - translatedY * sinTheta;
            const rotatedY = translatedX * sinTheta + translatedY * cosTheta;

            // Translate the point back to the original position
            const finalX = rotatedX + this.x;
            const finalY = rotatedY + this.y;

            return new Point(finalX, finalY);
        };
        this.cache.rotator.set(angle, func);
        return func;
    }

    rotate(angle: number, origin?: Point | undefined): Point {
        if (!origin) {
            return this;
        }
        return origin.as_center(angle)(this);
    }

    offset(p: Point): Point {
        return new Point(this.x + p.x, this.y + p.y);
    }

    multiply(scale: number, offset?: Point): Point {
        const offsetX = offset?.x ?? 0;
        const offsetY = offset?.y ?? 0;
        return new Point(this.x * scale + offsetX, this.y * scale + offsetY);
    }

    factor(f: number): Point {
        return new Point(this.x * f, this.y * f);
    }

    flip(axis: Axis): Point {
        switch (axis) {
            case "x":
                return new Point(-this.x, this.y);
            case "y":
                return new Point(this.x, -this.y);
            case "both":
                return new Point(-this.x, -this.y);
        }
    }

    map_points(f: (p: Point) => Point): Point {
        return f(this);
    }

    distance(p: Point): number {
        return Math.hypot(this.x - p.x, this.y - p.y);
    }

    to_line(p: Point): LineSegment {
        return new LineSegment(this, p);
    }

    bbox(): RectSolid {
        return new RectSolid(this.x, this.y, 0, 0);
    }

    tuple(): [number, number] {
        return [this.x, this.y];
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        debug_context(ctx, (ctx) => {
            this.to_circle_solid(2).render_fill(ctx);
        });
    }

    to_circle_solid(radius: number): CircleSolid {
        return new CircleSolid(this, radius);
    }

    lerp(t: number, to: number): number {
        return this.x + (to - this.x) * t;
    }

    interpolate(t: number, to: Point): ThisType<this> {
        return new Point(
            this.lerp(t, to.x),
            this.lerp(t, to.y),
        ) as ThisType<this>;
    }
}
