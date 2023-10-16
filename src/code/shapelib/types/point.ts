import { panic } from "functional-utilities";
import { debug_context } from "../funcs/render_debug";
import { CircleSolid } from "./circle_solid";
import type { Axis } from "./types";
import { LineSegment } from "./line_segment";
import { RectSolid } from "./rect_solid";
import type { Interpolate } from "~/code/funcs/interpolator";
import { v4 } from "uuid";
import { type Stringifiable } from "./interfaces/stringifiable";
import { type Transformable } from "./interfaces/transformable";
import { type PointMap } from "./interfaces/pointmap";
import { type BoundingBox } from "./interfaces/boundingbox";
import type { ThisReturn } from "~/code/bundle";

export class Point
    implements Stringifiable, Transformable, PointMap, BoundingBox, Interpolate
{
    x: number;
    y: number;

    private cache: {
        rotator: Map<number, (p: Point) => Point>;
        id?: string;
    } = { rotator: new Map() };

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static empty(): Point {
        return zerozero;
    }

    id(): string {
        if (this.cache.id) return this.cache.id;
        const id = v4();
        this.cache.id = id;
        return id;
    }

    to_string(): string {
        return `Point(${this.x}, ${this.y})`;
    }

    to_axis(axis: Axis) {
        switch (axis) {
            case "x":
                return new Point(this.x, 0) as this & ThisReturn;
            case "y":
                return new Point(0, this.y) as this & ThisReturn;
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

    center(): Point {
        return this;
    }

    magnitude(): number {
        return Math.hypot(this.x, this.y);
    }

    recenter(axis: Axis) {
        return new Point(
            axis !== "y" ? this.x : 0,
            axis !== "x" ? this.y : 0,
        ) as this & ThisReturn;
    }

    negate() {
        return new Point(-this.x, -this.y) as this & ThisReturn;
    }

    rotate(angle: number, origin?: Point | undefined) {
        if (!origin) {
            return this as this & ThisReturn;
        }
        return origin.as_center(angle)(this) as this & ThisReturn;
    }

    translate(p: Point) {
        return new Point(this.x + p.x, this.y + p.y) as this & ThisReturn;
    }

    multiply(scale: number) {
        return new Point(this.x * scale, this.y * scale) as this & ThisReturn;
    }

    scale(scale: number | Point, origin: Point) {
        const scalex = typeof scale === "number" ? scale : scale.x;
        const scaley = typeof scale === "number" ? scale : scale.y;

        // Scale the point relative to the origin
        const translatedX = this.x - origin.x;
        const translatedY = this.y - origin.y;

        const scaledX = translatedX * scalex;
        const scaledY = translatedY * scaley;

        // Translate the point back to the original position
        const finalX = scaledX + origin.x;
        const finalY = scaledY + origin.y;

        return new Point(finalX, finalY) as this & ThisReturn;
    }

    subtract(p: Point): Point {
        return new Point(this.x - p.x, this.y - p.y);
    }

    add(p: Point): Point {
        return new Point(this.x + p.x, this.y + p.y);
    }

    offset(p: Point): Point {
        return this.add(p);
    }

    wrap(rect: RectSolid): Point {
        // wrap the point such that it is within the rect
        return new Point(
            (this.x - rect.x) % rect.width,
            (this.y - rect.y) % rect.height,
        );
    }

    factor(f: number): Point {
        return new Point(this.x * f, this.y * f);
    }

    flip(axis: Axis) {
        switch (axis) {
            case "x":
                return new Point(-this.x, this.y) as this & ThisReturn;
            case "y":
                return new Point(this.x, -this.y) as this & ThisReturn;
            case "both":
                return new Point(-this.x, -this.y) as this & ThisReturn;
        }
    }

    similarity(to: this): number {
        return this.distance(to);
    }

    map_points(f: (p: Point) => Point) {
        return f(this) as this & ThisReturn;
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
            this.to_circle_solid(2).render(ctx, "fill");
        });
    }

    to_circle_solid(radius: number): CircleSolid {
        return new CircleSolid(this, radius);
    }

    lerp(t: number, to: Point) {
        return new Point(
            this.x + (to.x - this.x) * t,
            this.y + (to.y - this.y) * t,
        ) as this & ThisReturn;
    }

    midpoint(p: Point): Point {
        return this.lerp(0.5, p);
    }

    interpolate(t: number, to: this) {
        return this.lerp(t, to);
    }

    to_start() {
        return this as this & ThisReturn;
    }

    key(): string {
        return `${this.x},${this.y}`;
    }

    can_interpolate(value: unknown): value is this {
        return value instanceof Point;
    }
}

export const zerozero = new Point(0, 0);
