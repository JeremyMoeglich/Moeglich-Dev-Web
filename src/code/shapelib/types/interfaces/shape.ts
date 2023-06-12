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