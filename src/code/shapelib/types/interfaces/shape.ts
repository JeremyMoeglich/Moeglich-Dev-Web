import { type Axis } from "../types";
import type { Point } from "../point";
import { type HasArea, is_HasArea, has_area_bundler } from "./hasarea";
import { type HasLength, is_HasLength, has_length_bundler } from "./haslength";
import { type Id, is_Id, id_bundler } from "./id";
import {
    type Renderable,
    is_Renderable,
    renderable_bundler,
} from "./renderable";
import {
    type Stringifiable,
    is_Stringifiable,
    stringifiable_bundler,
} from "./stringifiable";
import {
    type Transformable,
    is_Transformable,
    transformable_bundler,
} from "./transformable";
import {
    type Bundler,
    createBundle,
    type ThisReturn,
    rebundle_functionality,
} from "~/code/bundle";
import { bounding_box_bundler } from "./boundingbox";
export interface Shape
    extends Transformable,
        Stringifiable,
        HasArea,
        HasLength,
        Renderable,
        Id {
    center(): Point;
    recenter(axis: Axis): this & ThisReturn;
}

export function is_Shape(value: unknown): value is Shape {
    return (
        is_Transformable(value) &&
        is_Stringifiable(value) &&
        is_HasArea(value) &&
        is_HasLength(value) &&
        is_Renderable(value) &&
        is_Id(value) &&
        (value as Shape).center !== undefined &&
        (value as Shape).recenter !== undefined
    );
}

export const shape_bundler: Bundler<Shape, Shape> = {
    isType: is_Shape,
    functionality: {
        ...rebundle_functionality<typeof transformable_bundler, Shape>(
            transformable_bundler
        ),
        ...stringifiable_bundler.functionality,
        ...has_area_bundler.functionality,
        ...has_length_bundler.functionality,
        ...rebundle_functionality<typeof renderable_bundler, Shape>(
            renderable_bundler
        ),
        ...id_bundler.functionality,
        center: (objects) => {
            return bounding_box_bundler.functionality.bbox(objects).center();
        },
        recenter: (objects, axis) => {
            const offset = bounding_box_bundler.functionality
                .bbox(objects)
                .center()
                .to_axis(axis)
                .negate();
            return createBundle(objects.map((o) => o.translate(offset)));
        },
    },
};
