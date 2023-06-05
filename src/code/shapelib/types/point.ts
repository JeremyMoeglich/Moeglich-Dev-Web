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
        Transformable,
        PointMap,
        BoundingBox,
        RenderableDebug,
        Interpolate
{
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

    to_axis(axis: Axis): this {
        switch (axis) {
            case "x":
                return new Point(this.x, 0) as this;
            case "y":
                return new Point(0, this.y) as this;
            case "both":
                return this;
        }
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

    negate(): this {
        return new Point(-this.x, -this.y) as this;
    }

    rotate(angle: number, origin?: Point | undefined): this {
        if (!origin) {
            return this;
        }
        return origin.as_center(angle)(this) as this;
    }

    translate(p: Point): this {
        return new Point(this.x + p.x, this.y + p.y) as this;
    }

    multiply(scale: number): this {
        return new Point(this.x * scale, this.y * scale) as this;
    }

    scale(scale: number, origin: Point): this {
        // Scale the point relative to the origin
        const translatedX = this.x - origin.x;
        const translatedY = this.y - origin.y;

        const scaledX = translatedX * scale;
        const scaledY = translatedY * scale;

        // Translate the point back to the original position
        const finalX = scaledX + origin.x;
        const finalY = scaledY + origin.y;

        return new Point(finalX, finalY) as this;
    }

    subtract(p: Point): Point {
        return new Point(this.x - p.x, this.y - p.y);
    }

    factor(f: number): Point {
        return new Point(this.x * f, this.y * f);
    }

    flip(axis: Axis): this {
        switch (axis) {
            case "x":
                return new Point(-this.x, this.y) as this;
            case "y":
                return new Point(this.x, -this.y) as this;
            case "both":
                return new Point(-this.x, -this.y) as this;
        }
    }

    map_points(f: (p: Point) => Point): this {
        return f(this) as this;
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

    interpolate(t: number, to: Point): this {
        return new Point(this.lerp(t, to.x), this.lerp(t, to.y)) as this;
    }

    key(): string {
        return `${this.x},${this.y}`;
    }
}
