import { zip } from "functional-utilities";
import { type Bundler, createBundle, type ThisMarker } from "../../../bundle";
import { type Axis } from "../types";
import { Point } from "../point";
import { RectSolid } from "../rect_solid";
import {
    type BoundingBox,
    bounding_box_bundler,
    is_BoundingBox,
} from "./boundingbox";

export interface Transformable extends BoundingBox {
    translate(offset: Point): this & ThisMarker;
    flip(axis: Axis): this & ThisMarker;
    rotate(angle: number, origin?: Point): this & ThisMarker; // origin is infered as center of bbox
    scale(scale: number, origin?: Point): this & ThisMarker; // origin is infered as center of bbox
}

export function is_Transformable(value: unknown): value is Transformable {
    return (
        (value as Transformable).translate !== undefined &&
        (value as Transformable).flip !== undefined &&
        (value as Transformable).rotate !== undefined &&
        (value as Transformable).scale !== undefined &&
        is_BoundingBox(value)
    );
}

export const transformable_bundler: Bundler<Transformable, Transformable> = {
    isType: is_Transformable,
    functionality: {
        ...bounding_box_bundler.functionality,
        flip(objs, axis) {
            const bboxes = objs.map((s) => s.bbox());
            const center = RectSolid.union(bboxes).center();

            // Flip each shape.
            const flippedShapes = objs.map((s) => s.flip(axis));

            // Translate each shape to its new position.
            const translatedShapes = zip([flippedShapes, bboxes] as [
                Transformable[],
                RectSolid[]
            ]).map(([s, b]) => {
                // calculate the translation vector for both axis
                const vec = b.center().translate(center.factor(-1));
                const axis_vec = new Point(
                    axis !== "y" ? vec.x : 0,
                    axis !== "x" ? vec.y : 0
                );
                return s.translate(axis_vec);
            });

            return createBundle(translatedShapes);
        },
        translate(objs, offset) {
            return createBundle(objs.map((s) => s.translate(offset)));
        },
        rotate(objs, angle, origin) {
            const o =
                origin ?? RectSolid.union(objs.map((s) => s.bbox())).center();
            return createBundle(objs.map((s) => s.rotate(angle, o)));
        },
        scale(objs, scale, origin) {
            const o =
                origin ?? RectSolid.union(objs.map((s) => s.bbox())).center();
            return createBundle(objs.map((s) => s.scale(scale, o)));
        },
    },
};
