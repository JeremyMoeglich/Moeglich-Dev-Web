import RBush, { type BBox } from "rbush";
import type { RectSolid } from "../types/rect_solid";
import { type BoundingBox } from "../types/interfaces/boundingbox";

interface RBushElement<T extends BoundingBox> {
    bbox: RectSolid;
    element: T;
}

class RectRBush<T extends BoundingBox> extends RBush<RBushElement<T>> {
    toBBox(item: RBushElement<T>): BBox {
        const rect = item.bbox;
        return {
            minX: rect.x,
            minY: rect.y,
            maxX: rect.x + rect.width,
            maxY: rect.y + rect.height,
        };
    }
    compareMinX(a: RBushElement<T>, b: RBushElement<T>): number {
        return a.bbox.x - b.bbox.x;
    }
    compareMinY(a: RBushElement<T>, b: RBushElement<T>): number {
        return a.bbox.y - b.bbox.y;
    }
}

export function create_collider<T extends BoundingBox, C extends BoundingBox>(
    shapes: T[],
    cmp: (shape: T, e: C) => boolean
) {
    const index = new RectRBush<T>();

    index.load(
        shapes.map((t) => ({
            bbox: t.bbox(),
            element: t,
        }))
    );

    return (element: C) => {
        const bbox = element.bbox();

        return index
            .search({
                minX: bbox.x,
                minY: bbox.y,
                maxX: bbox.x + bbox.width,
                maxY: bbox.y + bbox.height,
            })
            .some((c) => cmp(c.element, element));
    };
}
