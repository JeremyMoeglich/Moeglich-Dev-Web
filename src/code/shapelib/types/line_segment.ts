import { range } from "functional-utilities";
import { sample_amount_default } from "../funcs/sample_amount";
import type {
    Axis,
    BoundingBox,
    HasLength,
    PointMap,
    Stringifiable,
    Transformable,
} from "./interfaces";
import { Point } from "./point";
import { RectSolid } from "./rect_solid";

export class LineSegment
    implements
        Stringifiable,
        Transformable,
        PointMap,
        HasLength,
        BoundingBox
{
    start: Point;
    end: Point;

    constructor(start: Point, end: Point) {
        this.start = start;
        this.end = end;
    }

    toString(): string {
        return `Line(${this.start.toString()}, ${this.end.toString()})`;
    }

    translate(p: Point): this {
        return new LineSegment(this.start.translate(p), this.end.translate(p)) as this;
    }

    scale(scale: number, origin?: Point): this {
        const norigin = origin ?? new Point(0, 0);
        return new LineSegment(
            this.start.scale(scale, norigin),
            this.end.scale(scale, norigin)
        ) as this;
    }

    flip(axis: Axis): this {
        return new LineSegment(this.start.flip(axis), this.end.flip(axis)) as this;
    }

    map_points(f: (p: Point) => Point): this {
        return new LineSegment(f(this.start), f(this.end)) as this;
    }

    outline_length(): number {
        return this.start.distance(this.end);
    }

    sample_on_length(min_per_unit: number, variant: "evenly" | "rng"): Point[] {
        const length = this.outline_length();
        const num_points = sample_amount_default(
            length,
            min_per_unit,
            variant === "evenly" ? "min" : "rng"
        );
        if (variant === "evenly") {
            const step = length / num_points;
            return range(num_points).map((i) => this.lerp(i * step));
        } else {
            return range(num_points).map((_) =>
                this.lerp(Math.random() * length)
            );
        }
    }

    lerp(t: number): Point {
        return new Point(
            this.start.x + t * (this.end.x - this.start.x),
            this.start.y + t * (this.end.y - this.start.y)
        );
    }
    
    midpoint(): Point {
        return this.lerp(0.5);
    }

    sample_points(n: number, variant: "evenly" | "rng") {
        if (variant === "evenly") {
            return range(0, n).map((i) => this.lerp(i / (n - 1)));
        } else {
            return range(0, n).map((_) => this.lerp(Math.random()));
        }
    }

    bbox(): RectSolid {
        return new RectSolid(
            Math.min(this.start.x, this.end.x),
            Math.min(this.start.y, this.end.y),
            Math.abs(this.start.x - this.end.x),
            Math.abs(this.start.y - this.end.y)
        );
    }

    dx(): number {
        return this.end.x - this.start.x;
    }

    dy(): number {
        return this.end.y - this.start.y;
    }

    min_y(): number {
        return Math.min(this.start.y, this.end.y);
    }

    max_y(): number {
        return Math.max(this.start.y, this.end.y);
    }

    min_x(): number {
        return Math.min(this.start.x, this.end.x);
    }

    max_x(): number {
        return Math.max(this.start.x, this.end.x);
    }

    outline_intersects(other: LineSegment): boolean {
        const denominator = other.dy() * this.dx() - other.dx() * this.dy();

        if (denominator === 0) {
            return false;
        }

        const ua =
            (other.dx() * (this.start.y - other.start.y) -
                other.dy() * (this.start.x - other.start.x)) /
            denominator;
        const ub =
            (this.dx() * (this.start.y - other.start.y) -
                this.dy() * (this.start.x - other.start.x)) /
            denominator;

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
            return true;
        }

        return false;
    }

    right_point_intersections(p: Point): number {
        const denominator =
            this.dy() * (p.x - this.start.x) - this.dx() * (p.y - this.start.y);
        if (denominator === 0) {
            // parallel
            return 0;
        }
        const ua =
            (this.dx() * (p.y - this.start.y) -
                this.dy() * (p.x - this.start.x)) /
            denominator;
        if (ua >= 0 && ua <= 1) {
            // intersects
            return 1;
        }
        return 0; // doesn't intersect
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.stroke();
    }

    center(): Point {
        return new Point(
            (this.start.x + this.end.x) / 2,
            (this.start.y + this.end.y) / 2
        );
    }

    rotate(angle: number, origin?: Point | undefined): this {
        const o = origin ?? this.center();
        return new LineSegment(
            this.start.rotate(angle, o),
            this.end.rotate(angle, o)
        ) as this;
    }
}
