import { range } from "functional-utilities";
import { quality_to_amount_per_unit } from "../funcs/quality";
import { debug_context } from "../funcs/render_debug";
import { sample_amount_default } from "../funcs/sample_amount";
import type { Axis } from "./types";
import { Point, zerozero } from "./point";
import { PolygonSolid } from "./polygon_solid";
import { RectSolid } from "./rect_solid";
import type { TriangleSolid } from "./triangle_solid";
import type { Interpolate } from "~/code/funcs/interpolator";
import { v4 } from "uuid";
import type { SolidShape } from "./interfaces/solidshape";
import { type ThisReturn } from "~/code/bundle";
import { BezierSolid } from "./bezier_solid";
import { PartialBezier } from "./partial_bezier";
import { shapeaction } from "~/code/funcs/shapeact";

export class CircleSolid implements SolidShape, Interpolate {
    position: Point;
    radius: number;

    private cache: {
        id?: string;
    } = {};

    constructor(
        position: Point,
        radius: number,
        public ctx_setter?: (ctx: CanvasRenderingContext2D) => void
    ) {
        this.position = position;
        this.radius = radius;
    }

    static empty(): CircleSolid {
        return new CircleSolid(zerozero, 0);
    }

    id(): string {
        if (this.cache.id) return this.cache.id;
        const id = v4();
        this.cache.id = id;
        return id;
    }

    interpolate(t: number, to: this) {
        return new CircleSolid(
            this.position.interpolate(t, to.position),
            this.radius * (1 - t) + to.radius * t,
            this.ctx_setter
        ) as this & ThisReturn;
    }

    similarity(to: this): number {
        return (
            this.position.similarity(to.position) +
            Math.abs(this.radius - to.radius)
        );
    }

    to_start() {
        return new CircleSolid(this.position, 0, this.ctx_setter) as this &
            ThisReturn;
    }

    can_interpolate(value: unknown): value is this {
        return value instanceof CircleSolid;
    }

    area(): number {
        return Math.PI * this.radius ** 2;
    }

    approximated(quality: number): PolygonSolid {
        const amount_per_unit = quality_to_amount_per_unit(quality);
        const points = this.sample_on_length(amount_per_unit, "evenly");
        return new PolygonSolid(points);
    }

    outline_length(): number {
        return 2 * Math.PI * this.radius;
    }

    bbox(): RectSolid {
        const top_left = this.position.translate(
            new Point(-this.radius, -this.radius)
        );
        const diameter = this.radius * 2;
        return new RectSolid(top_left.x, top_left.y, diameter, diameter);
    }

    contains(p: Point): boolean {
        return p.distance(this.position) <= this.radius;
    }

    flip() {
        return this as this & ThisReturn;
    }

    translate(offset: Point) {
        return new CircleSolid(
            this.position.translate(offset),
            this.radius,
            this.ctx_setter
        ) as this & ThisReturn;
    }

    scale(scale: number | Point, origin = zerozero) {
        const scale_num =
            typeof scale === "number" ? scale : (scale.x + scale.y) / 2;
        return new CircleSolid(
            this.position.scale(scale, origin),
            this.radius * scale_num,
            this.ctx_setter
        ) as this & ThisReturn;
    }

    to_string(): string {
        return `CircleSolid(${this.position.to_string()}, ${this.radius})`;
    }

    intersects(other: this): boolean {
        return (
            this.position.distance(other.position) < this.radius + other.radius
        );
    }

    outline_intersects(other: this): boolean {
        const distanceBetweenCenters = this.position.distance(other.position);
        const radiiSum = this.radius + other.radius;
        const radiiDiff = Math.abs(this.radius - other.radius);

        return (
            distanceBetweenCenters < radiiSum &&
            distanceBetweenCenters >= radiiDiff
        );
    }

    relation_to(
        other: this
    ):
        | "this_inside_other"
        | "other_inside_this"
        | "outline_intersect"
        | "disjoint" {
        const distanceBetweenCenters = this.position.distance(other.position);
        const radiiSum = this.radius + other.radius;
        const radiiDiff = Math.abs(this.radius - other.radius);

        if (
            distanceBetweenCenters < radiiSum &&
            distanceBetweenCenters >= radiiDiff
        ) {
            return "outline_intersect";
        } else if (distanceBetweenCenters < radiiDiff) {
            if (this.radius > other.radius) {
                return "this_inside_other";
            } else {
                return "other_inside_this";
            }
        } else {
            return "disjoint";
        }
    }

    triangulate(quality: number): TriangleSolid[] {
        return this.approximated(quality).triangulate();
    }

    sample_on_length(min_per_unit: number, variant: "rng" | "evenly"): Point[] {
        const outline_length = this.outline_length();
        if (variant === "evenly") {
            const amount = Math.ceil(outline_length * min_per_unit);
            const points = [];
            for (let i = 0; i < amount; i++) {
                const angle = (2 * Math.PI * i) / amount;
                points.push(
                    this.position.translate(
                        new Point(Math.cos(angle), Math.sin(angle)).multiply(
                            this.radius
                        )
                    )
                );
            }
            return points;
        } else {
            const points: Point[] = [];
            const amount = sample_amount_default(
                outline_length,
                min_per_unit,
                "rng"
            );
            for (let i = 0; i < amount; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const x = this.position.x + this.radius * Math.cos(angle);
                const y = this.position.y + this.radius * Math.sin(angle);
                points.push(new Point(x, y));
            }
            return points;
        }
    }

    sample_on_area(min_per_unit: number, variant: "min" | "rng"): Point[] {
        const amount = sample_amount_default(
            this.area(),
            min_per_unit,
            variant
        );
        return range(amount).map(() => {
            const angle = Math.random() * 2 * Math.PI;
            const r = Math.sqrt(Math.random()) * this.radius;
            const x = this.position.x + r * Math.cos(angle);
            const y = this.position.y + r * Math.sin(angle);
            return new Point(x, y);
        });
    }

    right_point_intersections(p: Point): number {
        const dx = p.x - this.position.x;
        const dy = p.y - this.position.y;
        const discriminant = this.radius * this.radius - dy * dy;

        if (discriminant < 0) {
            return 0; // no intersections
        } else if (discriminant === 0) {
            return dx > 0 ? 1 : 0; // one intersection if the point is to the right of the center
        } else {
            // two intersections if the point is to the right of the leftmost intersection point
            const sqrtDiscriminant = Math.sqrt(discriminant);
            const x1 = this.position.x + dx - sqrtDiscriminant;
            const x2 = this.position.x + dx + sqrtDiscriminant;
            return x1 > p.x || x2 > p.x ? 2 : 1;
        }
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    }

    render(ctx: CanvasRenderingContext2D, action: "fill" | "stroke"): void {
        ctx.save();
        this.ctx_setter && this.ctx_setter(ctx);
        ctx.beginPath();
        this.select_shape(ctx);
        shapeaction(ctx, action);
        ctx.restore();
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        debug_context(ctx, (ctx) => {
            // mark center
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, 2, 0, 2 * Math.PI);
            ctx.fill();

            // draw from center to outline
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + this.radius, this.position.y);
            ctx.stroke();
        });
        ctx.restore();
    }

    to_bezier(): BezierSolid {
        const kappa = 4 * ((Math.sqrt(2) - 1) / 3);
        const x = this.position.x;
        const y = this.position.y;
        const r = this.radius;

        const bezierArray: PartialBezier[] = [];

        const handleLength = r * kappa;

        bezierArray.push(
            new PartialBezier(
                new Point(x + handleLength, y + r),
                new Point(x + r, y + handleLength),
                new Point(x + r, y)
            )
        );

        bezierArray.push(
            new PartialBezier(
                new Point(x + r, y - handleLength),
                new Point(x + handleLength, y - r),
                new Point(x, y - r)
            )
        );

        bezierArray.push(
            new PartialBezier(
                new Point(x - handleLength, y - r),
                new Point(x - r, y - handleLength),
                new Point(x - r, y)
            )
        );

        bezierArray.push(
            new PartialBezier(
                new Point(x - r, y + handleLength),
                new Point(x - handleLength, y + r),
                new Point(x, y + r)
            )
        );

        return new BezierSolid(bezierArray);
    }

    center(): Point {
        return this.position;
    }

    recenter(axis: Axis) {
        const offset = this.center().to_axis(axis).negate();
        return this.translate(offset);
    }

    rotate(angle: number, origin?: Point | undefined) {
        return new CircleSolid(
            this.position.rotate(angle, origin),
            this.radius,
            this.ctx_setter
        ) as this & ThisReturn;
    }

    set_setter(ctx_setter: (ctx: CanvasRenderingContext2D) => void) {
        this.ctx_setter = ctx_setter;
        return this as this & ThisReturn;
    }
}
