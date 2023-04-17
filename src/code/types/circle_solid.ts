import { range } from "functional-utilities";
import { quality_to_amount_per_unit } from "../funcs/quality";
import { debug_context } from "../funcs/render_debug";
import { sample_amount_default } from "../funcs/sample_amount";
import type { SolidShape } from "./interfaces";
import { Point } from "./point";
import { PolygonSolid } from "./polygon_solid";
import { RectSolid } from "./rect_solid";
import type { TriangleSolid } from "./triangle_solid";

export class CircleSolid implements SolidShape<CircleSolid> {
    position: Point;
    radius: number;

    constructor(position: Point, radius: number) {
        this.position = position;
        this.radius = radius;
    }

    area(): number {
        return Math.PI * this.radius ** 2;
    }

    approximated(quality: number): PolygonSolid {
        const amount_per_unit = quality_to_amount_per_unit(quality);
        const points = this.sample_on_length(amount_per_unit, 'evenly')
        return new PolygonSolid(points);
    }

    outline_length(): number {
        return 2 * Math.PI * this.radius;
    }

    bbox(): RectSolid {
        const top_left = this.position.offset(new Point(-this.radius, -this.radius));
        const diameter = this.radius * 2;
        return new RectSolid(top_left.x, top_left.y, diameter, diameter);
    }

    contains(p: Point): boolean {
        return p.distance(this.position) <= this.radius;
    }

    flip(): CircleSolid {
        return this;
    }

    offset(offset: Point): CircleSolid {
        return new CircleSolid(this.position.offset(offset), this.radius);
    }

    scale(scale: number, offset?: Point | undefined): CircleSolid {
        return new CircleSolid(this.position.scale(scale, offset), this.radius * scale);
    }

    toString(): string {
        return `CircleSolid(${this.position.toString()}, ${this.radius})`;
    }

    intersects(other: CircleSolid): boolean {
        return this.position.distance(other.position) < this.radius + other.radius;
    }

    outline_intersects(other: CircleSolid): boolean {
        const distanceBetweenCenters = this.position.distance(other.position);
        const radiiSum = this.radius + other.radius;
        const radiiDiff = Math.abs(this.radius - other.radius);

        return (
            distanceBetweenCenters < radiiSum && distanceBetweenCenters >= radiiDiff
        );
    }

    relation_to(other: CircleSolid): "this_inside_other" | "other_inside_this" | "outline_intersect" | "disjoint" {
        const distanceBetweenCenters = this.position.distance(other.position);
        const radiiSum = this.radius + other.radius;
        const radiiDiff = Math.abs(this.radius - other.radius);

        if (distanceBetweenCenters < radiiSum && distanceBetweenCenters >= radiiDiff) {
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
        if (variant === 'evenly') {
            const amount = Math.ceil(outline_length * min_per_unit);
            const points = [];
            for (let i = 0; i < amount; i++) {
                const angle = (2 * Math.PI * i) / amount;
                points.push(this.position.offset(new Point(Math.cos(angle), Math.sin(angle)).scale(this.radius)));
            }
            return points;
        } else {
            const points: Point[] = [];
            const amount = sample_amount_default(outline_length, min_per_unit, 'rng');
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
        const amount = sample_amount_default(this.area(), min_per_unit, variant);
        return range(amount).map(() => {
            const angle = Math.random() * 2 * Math.PI;
            const r = Math.sqrt(Math.random()) * this.radius;
            const x = this.position.x + r * Math.cos(angle);
            const y = this.position.y + r * Math.sin(angle);
            return new Point(x, y);
        })
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

    render_fill(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        this.select_shape(ctx);
        ctx.fill();
    }

    render_outline(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        this.select_shape(ctx);
        ctx.stroke();
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
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
        })
    }


}