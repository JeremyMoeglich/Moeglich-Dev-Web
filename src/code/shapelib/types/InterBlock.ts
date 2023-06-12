import { type UnMarkThis, type ThisReturn, unmark_this } from "~/code/bundle";
import type { Interpolate } from "~/code/funcs/interpolator";
import type { Renderable } from "./interfaces/renderable";
import type { Transformable } from "./interfaces/transformable";
import { Point } from "./point";
import { type RectSolid } from "./rect_solid";
import { type Axis } from "./types";

export class InterBlock<T extends Renderable & Transformable>
    implements Interpolate, Transformable, Renderable
{
    element: T;
    key: string;

    constructor(element: T, key: string) {
        this.element = element;
        this.key = key;
    }

    subelement(): T {
        return this.element;
    }

    interpolate(t: number, to: UnMarkThis<this>): this & ThisReturn {
        const element_bbox = this.element.bbox();
        const to_bbox = to.element.bbox();
        const scalex = 1 + t * (to_bbox.width / element_bbox.width - 1);
        const scaley = 1 + t * (to_bbox.height / element_bbox.height - 1);
        const offsetx =
            t *
            (to_bbox.x +
                to_bbox.width / 2 -
                (element_bbox.x + element_bbox.width / 2));
        const offsety =
            t *
            (to_bbox.y +
                to_bbox.height / 2 -
                (element_bbox.y + element_bbox.height / 2));
        const center = element_bbox.center();
        return new InterBlock(
            unmark_this(
                this.element
                    .scale(new Point(scalex, scaley), center)
                    .translate(new Point(offsetx, offsety))
            ),
            this.key
        ) as this & ThisReturn;
    }

    to_start(): this & ThisReturn {
        return new InterBlock(
            unmark_this(this.element.scale(0.001)),
            this.key
        ) as this & ThisReturn;
    }

    can_interpolate(value: unknown): boolean {
        return value instanceof InterBlock && value.key === this.key;
    }

    similarity(to: UnMarkThis<this>): number {
        const element_bbox = this.element.bbox();
        const to_bbox = to.element.bbox();
        return element_bbox.similarity(to_bbox);
    }

    bbox(): RectSolid {
        return this.element.bbox();
    }

    flip(axis: Axis): this & ThisReturn {
        return new InterBlock(
            unmark_this(this.element.flip(axis)),
            this.key
        ) as this & ThisReturn;
    }

    rotate(angle: number, center?: Point): this & ThisReturn {
        return new InterBlock(
            unmark_this(this.element.rotate(angle, center)),
            this.key
        ) as this & ThisReturn;
    }

    render(ctx: CanvasRenderingContext2D, action: "fill" | "stroke"): void {
        this.element.render(ctx, action);
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        this.element.render_debug(ctx);
    }

    scale(
        scale: number | Point,
        origin?: Point | undefined
    ): this & ThisReturn {
        return new InterBlock(
            unmark_this(this.element.scale(scale, origin)),
            this.key
        ) as this & ThisReturn;
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        this.element.select_shape(ctx);
    }

    set_setter(
        ctx_setter: (ctx: CanvasRenderingContext2D) => void
    ): this & ThisReturn {
        return new InterBlock(
            unmark_this(this.element.set_setter(ctx_setter)),
            this.key
        ) as this & ThisReturn;
    }

    translate(offset: Point): this & ThisReturn {
        return new InterBlock(
            unmark_this(this.element.translate(offset)),
            this.key
        ) as this & ThisReturn;
    }

    center(): Point {
        return this.element.center();
    }

    recenter(axis: Axis): this & ThisReturn {
        const center = this.center();
        const offset = new Point(
            axis !== "y" ? -center.x : 0,
            axis !== "x" ? -center.y : 0
        );
        return this.translate(offset);
    }
}
