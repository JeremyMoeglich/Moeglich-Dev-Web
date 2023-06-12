import { type BoundingBox, is_BoundingBox } from "./boundingbox";
import { type HasLength, is_HasLength } from "./haslength";
import { type Renderable, is_Renderable } from "./renderable";
import { type Transformable, is_Transformable } from "./transformable";

export interface Curve
    extends Renderable,
        Transformable,
        BoundingBox,
        HasLength {}

export function is_Curve(value: unknown): value is Curve {
    return (
        is_Renderable(value) &&
        is_Transformable(value) &&
        is_BoundingBox(value) &&
        is_HasLength(value)
    );
}
