import type { Bundler } from "../../../bundle";
import { RectSolid } from "../rect_solid";

export interface BoundingBox {
    bbox(): RectSolid;
}

export function is_BoundingBox(value: unknown): value is BoundingBox {
    return (value as BoundingBox).bbox !== undefined;
}

export const bounding_box_bundler: Bundler<BoundingBox, BoundingBox> = {
    isType: is_BoundingBox,
    functionality: {
        bbox(objs): RectSolid {
            return RectSolid.union(objs.map((s) => s.bbox()));
        },
    },
};
