import { bezierBezierIntersectionFast } from "flo-bezier3";
import type {
    Axis,
    BoundingBox,
    HasLength,
    PointMap,
    RenderableOutline,
    Stringifiable,
    Transformable,
} from "./interfaces";
import type { PartialBezier } from "./partial_bezier";
import { Point } from "./point";
import { RectSolid } from "./rect_solid";
import { find_roots_cubic, find_roots_quadratic } from "../../funcs/roots";
import { debug_context } from "../funcs/render_debug";
import { Interpolate } from "~/code/funcs/interpolator";
import { v4 } from "uuid";

export class FullBezier
    implements
        Transformable,
        Stringifiable,
        PointMap,
        BoundingBox,
        HasLength,
        RenderableOutline,
        Interpolate
{
    start_point: Point;
    bezier: PartialBezier;

    private cache: {
        id?: string;
    } = {};

    constructor(start_point: Point, bezier: PartialBezier) {
        this.start_point = start_point;
        this.bezier = bezier;
    }

    id(): string {
        if (this.cache.id) return this.cache.id;
        const id = v4();
        this.cache.id = id;
        return id;
    }

    toString(): string {
        return `FullBezier(sp=${this.start_point.toString()}, b=${this.bezier.toString()})`;
    }

    interpolate(t: number, to: this): this {
        return new FullBezier(
            this.start_point.interpolate(t, to.start_point),
            this.bezier.interpolate(t, to.bezier)
        ) as this;
    }

    similarity(to: this): number {
        return (
            this.start_point.similarity(to.start_point) +
            this.bezier.similarity(to.bezier)
        );
    }

    to_start(): this {
        return this;
    }

    is_this(value: unknown): value is this {
        return value instanceof FullBezier;
    }

    translate(p: Point): this {
        return new FullBezier(
            this.start_point.translate(p),
            this.bezier.translate(p)
        ) as this;
    }

    scale(scale: number, origin: Point): this {
        return new FullBezier(
            this.start_point.scale(scale, origin),
            this.bezier.scale(scale, origin)
        ) as this;
    }

    flip(axis: Axis): this {
        return new FullBezier(
            this.start_point.flip(axis),
            this.bezier.flip(axis)
        ) as this;
    }

    map_points(f: (p: Point) => Point): this {
        return new FullBezier(
            f(this.start_point),
            this.bezier.map_points(f)
        ) as this;
    }

    bbox(): RectSolid {
        const xv = [
            this.start_point.x,
            this.bezier.handle1.x,
            this.bezier.handle2.x,
            this.bezier.end_point.x,
        ];
        const yv = [
            this.start_point.y,
            this.bezier.handle1.y,
            this.bezier.handle2.y,
            this.bezier.end_point.y,
        ];

        // coefficients for x and y cubic bezier curves
        const a3x =
            -this.start_point.x +
            3 * (this.bezier.handle1.x - this.bezier.handle2.x) +
            this.bezier.end_point.x;
        const a2x =
            3 *
            (this.start_point.x -
                2 * this.bezier.handle1.x +
                this.bezier.handle2.x);
        const a1x = 3 * (this.bezier.handle1.x - this.start_point.x);

        const a3y =
            -this.start_point.y +
            3 * (this.bezier.handle1.y - this.bezier.handle2.y) +
            this.bezier.end_point.y;
        const a2y =
            3 *
            (this.start_point.y -
                2 * this.bezier.handle1.y +
                this.bezier.handle2.y);
        const a1y = 3 * (this.bezier.handle1.y - this.start_point.y);

        // roots of the derivative of x and y cubic bezier curves
        const tx = find_roots_quadratic(3 * a3x, 2 * a2x, a1x);
        const ty = find_roots_quadratic(3 * a3y, 2 * a2y, a1y);

        // add extrema to xv and yv
        for (const t of tx) {
            if (t > 0 && t < 1)
                xv.push(
                    (1 - t) * (1 - t) * (1 - t) * this.start_point.x +
                        3 * (1 - t) * (1 - t) * t * this.bezier.handle1.x +
                        3 * (1 - t) * t * t * this.bezier.handle2.x +
                        t * t * t * this.bezier.end_point.x
                );
        }
        for (const t of ty) {
            if (t > 0 && t < 1)
                yv.push(
                    (1 - t) * (1 - t) * (1 - t) * this.start_point.y +
                        3 * (1 - t) * (1 - t) * t * this.bezier.handle1.y +
                        3 * (1 - t) * t * t * this.bezier.handle2.y +
                        t * t * t * this.bezier.end_point.y
                );
        }

        const mx = Math.min(...xv);
        const my = Math.min(...yv);
        const Mx = Math.max(...xv);
        const My = Math.max(...yv);

        return new RectSolid(mx, my, Mx - mx, My - my);
    }

    outline_length(): number {
        const { handle1, handle2, end_point } = this.bezier;
        const start_point = this.start_point;

        const dx1 = handle1.x - start_point.x;
        const dy1 = handle1.y - start_point.y;
        const dx2 = handle2.x - handle1.x;
        const dy2 = handle2.y - handle1.y;
        const dx3 = end_point.x - handle2.x;
        const dy3 = end_point.y - handle2.y;

        const ax = dx1 + dx2 + dx3;
        const ay = dy1 + dy2 + dy3;
        const bx = dx1 + 2 * dx2 + dx3;
        const by = dy1 + 2 * dy2 + dy3;
        const A = 4 * (ax * ax + ay * ay);
        const B = 4 * (ax * bx + ay * by);
        const C = bx * bx + by * by;

        const Sabc = 2 * Math.sqrt(A + B + C);
        const A_2 = Math.sqrt(A);
        const A_32 = 2 * A * A_2;
        const C_2 = 2 * Math.sqrt(C);
        const BA = B / A_2;

        return (
            (A_32 * Sabc +
                A_2 * B * (Sabc - C_2) +
                (4 * C * A - B * B) *
                    Math.log((2 * A_2 + BA + Sabc) / (BA + C_2))) /
            (4 * A_32)
        );
    }

    outline_length_up_to(t: number, steps = 10): number {
        const dt = t / steps; // Step size
        let length = 0;

        // Calculate the length of the curve up to t
        for (let i = 0; i < steps; i++) {
            const t1 = i * dt;
            const t2 = (i + 1) * dt;
            const p1 = this.sample_t(t1);
            const p2 = this.sample_t(t2);
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            length += Math.sqrt(dx * dx + dy * dy);
        }

        // for debug we rerun the calculation with more steps TODO: remove
        const res2 = this.outline_length_up_to(t, steps * 100);
        // we log the factor by which the length differs from the more accurate calculation
        console.log(
            `length factor: ${length / res2}, steps: ${steps} to ${steps * 100}`
        );

        return length;
    }

    sample_on_length(min_per_unit: number): Point[] {
        const length = this.outline_length();
        const n = Math.ceil(length * min_per_unit);
        return this.sample_points(n);
    }

    sample_points(n: number): Point[] {
        const points: Point[] = [];

        for (let i = 1; i < n + 1; i++) {
            const t = i / (n + 1);
            points.push(this.sample_t(t));
        }

        return points;
    }

    outline_intersects(other: FullBezier): boolean {
        const intersections = bezierBezierIntersectionFast(
            [
                this.start_point.tuple(),
                this.bezier.handle1.tuple(),
                this.bezier.handle2.tuple(),
                this.bezier.end_point.tuple(),
            ],
            [
                other.start_point.tuple(),
                other.bezier.handle1.tuple(),
                other.bezier.handle2.tuple(),
                other.bezier.end_point.tuple(),
            ]
        );
        return intersections.length > 0;
    }

    right_point_intersections(p: Point): number {
        // Counts the number of times a horizontal line passing through a point intersects a curve segment defined by this FullBezier curve.
        // This is used to determine if a point is inside a shape.

        const { handle1, handle2, end_point } = this.bezier;
        const start_point = this.start_point;

        const h0 = start_point;
        const h1 = handle1;
        const h2 = handle2;
        const h3 = end_point;

        const a = h3.y - 3 * h2.y + 3 * h1.y - h0.y;
        const b = 3 * h2.y - 6 * h1.y + 3 * h0.y;
        const c = 3 * h1.y - 3 * h0.y;
        const d = h0.y - p.y;

        const roots = find_roots_cubic(a, b, c, d).filter(
            (t) => t >= 0 && t <= 1
        );
        const x_values = roots.map((t) => this.sample_t_x(t));
        return x_values.filter((x) => x >= p.x).length;
    }

    sample_t(t: number): Point {
        // Returns a point on the curve at a given t value
        return new Point(this.sample_t_x(t), this.sample_t_y(t));
    }

    sample_t_x(t: number): number {
        return (
            Math.pow(1 - t, 3) * this.start_point.x +
            3 * Math.pow(1 - t, 2) * t * this.bezier.handle1.x +
            3 * (1 - t) * Math.pow(t, 2) * this.bezier.handle2.x +
            Math.pow(t, 3) * this.bezier.end_point.x
        );
    }

    sample_t_y(t: number): number {
        return (
            Math.pow(1 - t, 3) * this.start_point.y +
            3 * Math.pow(1 - t, 2) * t * this.bezier.handle1.y +
            3 * (1 - t) * Math.pow(t, 2) * this.bezier.handle2.y +
            Math.pow(t, 3) * this.bezier.end_point.y
        );
    }

    t_from_length(length: number): number {
        let t = 0.5; // initial guess for t
        let lengthSoFar = 0;
        let iterations = 0;

        while (iterations < 10000) {
            // reduce maximum iterations to 10,000
            const curveLength = this.outline_length_up_to(t);
            const difference = length - lengthSoFar - curveLength;

            if (Math.abs(difference) < 0.001) {
                if (iterations > 1000) {
                    console.warn(
                        `getCubicBezierTForLength took ${iterations} iterations to converge`
                    );
                } else if (iterations > 100) {
                    console.warn(
                        `getCubicBezierTForLength took ${iterations} iterations to converge - consider increasing tolerance`
                    );
                }
                return t;
            }

            const derivative =
                this.outline_length_up_to(t + 0.001) - curveLength;
            t += difference / derivative;
            lengthSoFar += curveLength;
            iterations++;
        }

        throw new Error(
            `Could not find t value for length ${length} within ${iterations} iterations`
        );
    }

    rotate(angle: number, origin?: Point | undefined): this {
        const o = origin ?? this.bbox().center();
        return new FullBezier(
            this.start_point.rotate(angle, o),
            this.bezier.map_points((p) => p.rotate(angle, o))
        ) as this;
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        ctx.moveTo(this.start_point.x, this.start_point.y);
        ctx.bezierCurveTo(
            this.bezier.handle1.x,
            this.bezier.handle1.y,
            this.bezier.handle2.x,
            this.bezier.handle2.y,
            this.bezier.end_point.x,
            this.bezier.end_point.y
        );
    }

    render_outline(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        this.select_shape(ctx);
        ctx.stroke();
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        debug_context(ctx, (ctx) => {
            this.render_outline(ctx);
            this.start_point.render_debug(ctx);
            this.bezier.handle1.render_debug(ctx);
            this.bezier.handle2.render_debug(ctx);
            this.bezier.end_point.render_debug(ctx);
        });
    }
}
