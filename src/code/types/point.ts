import { debug_context } from "../funcs/render_debug";
import { CircleSolid } from "./circle_solid";
import type { Axis, BoundingBox, PointMap, RenderableDebug, Stringifiable, Transformable } from "./interfaces";
import { LineSegment } from "./line_segment";
import { RectSolid } from "./rect_solid";

export class Point implements Stringifiable, Transformable<Point>, PointMap<Point>, BoundingBox, RenderableDebug {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toString(): string {
        return `Point(${this.x}, ${this.y})`;
    }

    offset(p: Point): Point {
        return new Point(this.x + p.x, this.y + p.y);
    }

    scale(scale: number, offset?: Point): Point {
        const offsetX = offset?.x ?? 0;
        const offsetY = offset?.y ?? 0;
        return new Point(this.x * scale + offsetX, this.y * scale + offsetY);
    }

    flip(axis: Axis): Point {
        switch (axis) {
            case 'x':
                return new Point(-this.x, this.y);
            case 'y':
                return new Point(this.x, -this.y);
            case 'both':
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
        })
    }

    to_circle_solid(radius: number): CircleSolid {
        return new CircleSolid(this, radius);
    }
}