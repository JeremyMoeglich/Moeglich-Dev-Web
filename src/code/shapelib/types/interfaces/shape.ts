import { type HasArea, is_HasArea } from "./hasarea";
import { type HasLength, is_HasLength } from "./haslength";
import { type Id, is_Id } from "./id";
import {
    type Renderable,
    is_Renderable,
} from "./renderable";
import {
    type Stringifiable,
    is_Stringifiable,
} from "./stringifiable";
import {
    type Transformable,
    is_Transformable,
} from "./transformable";
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