import { cyclic_pairs, panic, zip } from "functional-utilities";
import { FullBezier } from "./full_bezier";
import type { Axis } from "./types";
import type { PartialBezier } from "./partial_bezier";
import type { Point } from "./point";
import { PolygonSolid } from "./polygon_solid";
import { RectSolid } from "./rect_solid";
import { quality_to_amount_per_unit } from "../funcs/quality";
import { create_collider } from "../funcs/create_collider";
import { create_range_collider } from "../funcs/create_range_collider";
import { sum } from "lodash-es";
import type { TriangleSolid } from "./triangle_solid";
import { debug_context } from "../funcs/render_debug";
import type { Interpolate } from "~/code/funcs/interpolator";
import { v4 } from "uuid";
import { type Bundle, createBundle, type ThisReturn } from "../../bundle";
import type { Id } from "./interfaces/id";
import type { SolidShape } from "./interfaces/solidshape";
import { shapeaction } from "~/code/funcs/shapeact";

export type PointWithHandles = {
    start_handle: Point;
    point: Point;
    end_handle: Point;
};

export class BezierSolid implements SolidShape, Interpolate, Id {
    bezier: PartialBezier[];

    private cache: {
        outline_length?: number;
        bbox?: RectSolid;
        approximated?: PolygonSolid;
        outline_collider?: (p: FullBezier) => boolean;
        contains_collider?: (p: Point) => boolean;
        right_point_counter?: (p: Point) => number;
        length_to_t?: (l: number) => number;
        id?: string;
    } = {};

    constructor(
        bezier: PartialBezier[],
        public ctx_setter?: (ctx: CanvasRenderingContext2D) => void,
    ) {
        this.bezier = bezier;
    }

    static empty(): BezierSolid {
        return new BezierSolid([]);
    }

    id(): string {
        if (this.cache.id) return this.cache.id;
        const id = v4();
        this.cache.id = id;
        return id;
    }

    to_start() {
        return this.scale(1);
    }

    can_interpolate(value: unknown): value is this {
        return value instanceof BezierSolid;
    }

    interpolate(t: number, to: this) {
        return new BezierSolid(
            zip([this.bezier, to.bezier]).map(([a, b]) => a.interpolate(t, b)),
            this.ctx_setter,
        ) as this & ThisReturn;
    }

    similarity(to: this): number {
        return (
            sum(
                zip([this.bezier, to.bezier]).map(([a, b]) => a.similarity(b)),
            ) * Math.abs(this.bezier.length - to.bezier.length + 1)
        );
    }

    to_string(): string {
        return `BezierSolid(${this.bezier
            .map((b) => b.to_string())
            .join(", ")})`;
    }

    to_points_with_handles(): PointWithHandles[] {
        return cyclic_pairs(this.bezier).map(([prev, next]) => ({
            start_handle: prev.handle2,
            point: prev.end_point,
            end_handle: next.handle1,
        }));
    }

    translate(p: Point) {
        return new BezierSolid(
            this.bezier.map((b) => b.translate(p)),
            this.ctx_setter,
        ) as this & ThisReturn;
    }

    scale(scale: number | Point, origin?: Point) {
        const o = origin ?? this.bbox().center();
        return new BezierSolid(
            this.bezier.map((b) => b.scale(scale, o)),
            this.ctx_setter,
        ) as this & ThisReturn;
    }

    flip(axis: Axis) {
        return new BezierSolid(
            this.bezier.map((b) => b.flip(axis)),
            this.ctx_setter,
        ) as this & ThisReturn;
    }

    map_points(f: (p: Point) => Point) {
        return new BezierSolid(
            this.bezier.map((b) => b.map_points(f)),
            this.ctx_setter,
        ) as this & ThisReturn;
    }

    bbox(): RectSolid {
        const fullbeziers = this.fullBeziers();
        const boxes = fullbeziers.objs.map((b) => b.bbox());

        const mx = Math.min(...boxes.map((b) => b.x));
        const my = Math.min(...boxes.map((b) => b.y));
        const Mx = Math.max(...boxes.map((b) => b.x + b.width));
        const My = Math.max(...boxes.map((b) => b.y + b.height));

        return new RectSolid(mx, my, Mx - mx, My - my);
    }

    fullBeziers(): Bundle<FullBezier> {
        return createBundle(
            cyclic_pairs(this.bezier).map(
                ([prev, next]) => new FullBezier(prev.end_point, next),
            ),
        );
    }

    approximated(quality: number): PolygonSolid {
        if (this.cache.approximated) return this.cache.approximated;
        const polygon = new PolygonSolid(
            this.fullBeziers().sample_on_length(
                quality_to_amount_per_unit(quality),
                "evenly",
            ),
        );
        this.cache.approximated = polygon;
        return polygon;
    }

    triangulate(quality: number): TriangleSolid[] {
        return this.approximated(quality).triangulate();
    }

    area(): number {
        // TODO do exact calculation
        return this.approximated(1).area();
    }

    contains(p: Point): boolean {
        const right_point_intersection_count =
            this.right_point_intersections(p);
        return right_point_intersection_count % 2 === 1;
    }

    outline_length(): number {
        if (this.cache.outline_length) return this.cache.outline_length;
        const length = this.fullBeziers().objs.reduce(
            (acc, b) => acc + b.outline_length(),
            0,
        );
        this.cache.outline_length = length;
        return length;
    }

    sample_on_length(amount: number): Point[] {
        // TODO: This doesn't same the exact amount of points
        const fullbeziers = this.fullBeziers();
        const lengths = fullbeziers.objs.map((b) => b.outline_length());
        const total_length = lengths.reduce((acc, l) => acc + l, 0);
        const amount_per_unit = amount / total_length;
        const points = zip([fullbeziers.objs, lengths]).flatMap(([b, l]) =>
            b.sample_on_length(amount_per_unit * l),
        );
        return points;
    }

    sample_on_area(min_per_unit: number, variant: "min" | "rng"): Point[] {
        // TODO do exact calculation
        return this.approximated(1).sample_on_area(min_per_unit, variant);
    }

    outline_intersects(other: this): boolean {
        if (this.cache.outline_collider)
            return other
                .fullBeziers()
                .objs.some((b) => (this.cache.outline_collider ?? panic())(b));
        const collider = create_collider<FullBezier, FullBezier>(
            this.fullBeziers().objs,
            (b1, b2) => b1.outline_intersects(b2),
        );
        this.cache.outline_collider = collider;
        return other.fullBeziers().objs.some((b) => collider(b));
    }

    intersects(other: this & ThisReturn): boolean {
        return this.relation_to(other) !== "disjoint";
    }

    relation_to(
        other: this,
    ):
        | "this_inside_other"
        | "other_inside_this"
        | "outline_intersect"
        | "disjoint" {
        if (other.bezier.length === 0) return "disjoint";
        if (this.bezier.length === 0) return "disjoint";
        if (!this.bbox().intersects(other.bbox())) return "disjoint";
        if (this.outline_intersects(other)) return "outline_intersect";
        if (
            this.contains(
                (
                    other.bezier[0] ??
                    panic("Bezier has not segments despite checking (Internal)")
                ).end_point,
            )
        )
            return "other_inside_this";
        if (
            other.contains(
                (
                    this.bezier[0] ??
                    panic("Bezier has not segments despite checking (Internal)")
                ).end_point,
            )
        )
            return "this_inside_other";
        return "disjoint";
    }

    right_point_intersections(p: Point): number {
        if (this.cache.right_point_counter)
            return this.cache.right_point_counter(p);
        const collider = create_range_collider<FullBezier, Point>(
            this.fullBeziers().objs,
            (b) => {
                const bbox = b.bbox();
                return [bbox.y, bbox.y + bbox.height];
            },
            (p) => [p.y, p.y],
        );
        const counter = (p: Point) => {
            const intersections = collider(p);
            const amounts = intersections.map((b) =>
                b.right_point_intersections(p),
            );
            return sum(amounts);
        };
        this.cache.right_point_counter = counter;
        return counter(p);
    }

    push_segment(segment: PartialBezier) {
        this.bezier.push(segment);
        this.cache = {};
    }

    segment_amount(): number {
        return this.bezier.length;
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        if (this.bezier.length === 0) return;
        this.bezier.concat([this.bezier.at(0) ?? panic()]).forEach((b, i) => {
            if (i === 0) {
                ctx.moveTo(b.end_point.x, b.end_point.y);
            } else {
                ctx.bezierCurveTo(
                    b.handle1.x,
                    b.handle1.y,
                    b.handle2.x,
                    b.handle2.y,
                    b.end_point.x,
                    b.end_point.y,
                );
            }
        });
    }

    render(ctx: CanvasRenderingContext2D, action: "stroke" | "fill"): void {
        ctx.save();
        this.ctx_setter && this.ctx_setter(ctx);
        ctx.beginPath();
        this.select_shape(ctx);
        shapeaction(ctx, action);
        ctx.restore();
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        if (this.bezier.length === 0) return;
        ctx.save();
        debug_context(ctx, (ctx) => {
            const points_with_handles = this.to_points_with_handles();
            for (const p of points_with_handles) {
                p.start_handle.to_circle_solid(2).render(ctx, "fill");
                p.end_handle.to_circle_solid(2).render(ctx, "fill");
                p.point.to_circle_solid(2).render(ctx, "fill");
                p.start_handle.to_line(p.point).render(ctx);
                p.end_handle.to_line(p.point).render(ctx);
            }

            // mark [0] as red
            ctx.fillStyle = "red";
            (points_with_handles[0] ?? panic()).point
                .to_circle_solid(3)
                .render(ctx, "fill");
        });
        ctx.restore();
    }

    sample_t(t: number): Point | undefined {
        if (this.bezier.length === 0) return undefined;
        // each curve has a t-length of 1
        // so 1.5 refers to the t-value 0.5 of the second curve

        const curve_index = Math.floor(t);
        if (curve_index >= this.bezier.length) return undefined;
        const last_curve = this.bezier.at(curve_index - 1) ?? panic(); // this naturally indexes the last curve if curve_index is 0
        const next_curve = this.bezier.at(curve_index) ?? panic();
        const curve = new FullBezier(last_curve.end_point, next_curve);
        const curve_t = t - curve_index;

        return curve.sample_t(curve_t);
    }

    center(): Point {
        return this.bbox().center();
    }

    recenter(axis: Axis) {
        const offset = this.center().to_axis(axis).negate();
        return this.translate(offset);
    }

    rotate(angle: number, origin?: Point | undefined) {
        const o = origin ?? this.center();
        return this.map_points((p) => p.rotate(angle, o));
    }

    set_setter(ctx_setter: (ctx: CanvasRenderingContext2D) => void) {
        this.ctx_setter = ctx_setter;
        return this as this & ThisReturn;
    }
}
