import { type Interpolate } from "~/code/funcs/interpolator";
import { type Renderable } from "./interfaces/renderable";
import { Point, zerozero } from "./point";
import { RectSolid } from "./rect_solid";
import { type Transformable } from "./interfaces/transformable";
import { type ThisReturn, type UnMarkThis } from "~/code/bundle";
import { type Axis } from "./types";
import { PolygonSolid } from "./polygon_solid";

export class ImageSolid implements Renderable, Interpolate, Transformable {
    readonly image: HTMLImageElement;
    readonly angle: number = 0;
    constructor(
        image: string | HTMLImageElement,
        public readonly image_center: Point,
        public readonly width: number,
        public readonly height: number,
        angle?: number,
        public ctx_setter?: (ctx: CanvasRenderingContext2D) => void,
    ) {
        if (typeof image === "string") {
            this.image = new Image();
            this.image.src = image;
        } else {
            this.image = image;
        }
        if (angle !== undefined) {
            this.angle = angle;
        }
    }

    to_polygon(): PolygonSolid {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        const points: Point[] = [
            new Point(-halfWidth, -halfHeight),
            new Point(halfWidth, -halfHeight),
            new Point(halfWidth, halfHeight),
            new Point(-halfWidth, halfHeight),
        ].map((point) =>
            point
                .rotate(this.angle, this.image_center)
                .translate(this.image_center),
        );

        return new PolygonSolid(points);
    }

    bbox(): RectSolid {
        return new RectSolid(
            this.image_center.x - this.width / 2,
            this.image_center.y - this.height / 2,
            this.width,
            this.height,
        ).rotate(this.angle, this.image_center);
    }

    render(ctx: CanvasRenderingContext2D, action: "fill" | "stroke"): void {
        if (action === "fill") {
            this.ctx_setter && this.ctx_setter(ctx);
            ctx.save();
            ctx.translate(this.image_center.x, this.image_center.y);
            ctx.rotate(this.angle);
            ctx.drawImage(
                this.image,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height,
            );
            ctx.restore();
        } else {
            this.to_polygon().render(ctx, action);
        }
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        this.render(ctx, "fill");
        this.render(ctx, "stroke");
    }

    translate(offset: Point): this & ThisReturn {
        return new ImageSolid(
            this.image,
            this.image_center.translate(offset),
            this.image.width,
            this.image.height,
            this.angle,
        ) as this & ThisReturn;
    }

    scale(factor: number | Point, origin?: Point): this & ThisReturn {
        const o = origin ?? this.image_center;
        const factor_x = typeof factor === "number" ? factor : factor.x;
        const factor_y = typeof factor === "number" ? factor : factor.y;
        return new ImageSolid(
            this.image,
            this.image_center.scale(factor, o),
            this.image.width * factor_x,
            this.image.height * factor_y,
            this.angle,
        ) as this & ThisReturn;
    }

    rotate(angle: number, origin?: Point): this & ThisReturn {
        const o = origin ?? this.image_center;
        return new ImageSolid(
            this.image,
            this.image_center.rotate(angle, o),
            this.image.width,
            this.image.height,
            this.angle + angle,
        ) as this & ThisReturn;
    }

    recenter(axis: "both" | "x" | "y"): this & ThisReturn {
        return new ImageSolid(
            this.image,
            zerozero.to_axis(axis),
            this.image.width,
            this.image.height,
            this.angle,
        ) as this & ThisReturn;
    }

    interpolate(t: number, to: this): this & ThisReturn {
        return new ImageSolid(
            to.image,
            this.image_center.interpolate(t, to.image_center),
            this.width + (to.width - this.width) * t,
            this.height + (to.height - this.height) * t,
            this.angle + (to.angle - this.angle) * t,
        ) as this & ThisReturn;
    }

    can_interpolate(value: unknown): boolean {
        return (
            value instanceof ImageSolid && this.image.src === value.image.src
        );
    }

    similarity(to: UnMarkThis<this>): number {
        return (
            this.image_center.distance(to.image_center) +
            0.5 * Math.abs(this.width - to.width) +
            0.5 * Math.abs(this.height - to.height) +
            0.2 * Math.abs(this.angle - to.angle)
        );
    }

    center(): Point {
        return this.image_center;
    }

    flip(axis: Axis): this & ThisReturn {
        const w = axis !== "y" ? -this.width : this.width;
        const h = axis !== "x" ? -this.height : this.height;
        return new ImageSolid(
            this.image,
            this.image_center,
            w,
            h,
            this.angle,
        ) as this & ThisReturn;
    }

    to_start(): this & ThisReturn {
        return new ImageSolid(this.image, this.image_center, 0, 0, 0) as this &
            ThisReturn;
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        this.to_polygon().select_shape(ctx);
    }

    set_setter(ctx_setter: (ctx: CanvasRenderingContext2D) => void) {
        this.ctx_setter = ctx_setter;
        return this as this & ThisReturn;
    }
}
