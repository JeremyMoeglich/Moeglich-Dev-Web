import { type BoundingBox, is_BoundingBox } from "./boundingbox";
import { type HasLength, is_HasLength } from "./haslength";
import { type RenderableOutline, is_RenderableOutline } from "./renderable";
import { type Transformable, is_Transformable } from "./transformable";

export interface Curve
    extends RenderableOutline,
        Transformable,
        BoundingBox,
        HasLength {}

export function is_Curve(value: unknown): value is Curve {
    return (
        is_RenderableOutline(value) &&
        is_Transformable(value) &&
        is_BoundingBox(value) &&
        is_HasLength(value)
    );
}
