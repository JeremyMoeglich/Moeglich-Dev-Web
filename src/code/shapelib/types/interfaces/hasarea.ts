import { type Bundler } from "~/code/bundle";
import { type TriangleSolid } from "../triangle_solid";
import {
    type BoundingBox,
    bounding_box_bundler,
    is_BoundingBox,
} from "./boundingbox";
import { type Point } from "../point";

export interface HasArea extends BoundingBox {
    area(): number;
    triangulate(quality: number): TriangleSolid[]; // refer to approximated() for quality conventions
    sample_on_area(min_per_unit: number, variant: "min" | "rng"): Point[];
    contains(p: Point, quality: number): boolean; // refer to approximated() for quality conventions
}

export function is_HasArea(value: unknown): value is HasArea {
    return (
        (value as HasArea).area !== undefined &&
        (value as HasArea).triangulate !== undefined &&
        (value as HasArea).sample_on_area !== undefined &&
        (value as HasArea).contains !== undefined &&
        is_BoundingBox(value)
    );
}

export const has_area_bundler: Bundler<HasArea, HasArea> = {
    isType: is_HasArea,
    functionality: {
        ...bounding_box_bundler.functionality,
        area: (objects) => {
            return objects.map((o) => o.area()).reduce((a, b) => a + b, 0);
        },
        triangulate: (objects, quality) => {
            return objects.flatMap((o) => o.triangulate(quality));
        },
        sample_on_area: (objects, min_per_unit, variant) => {
            const points = objects.flatMap((o) =>
                o.sample_on_area(min_per_unit, variant),
            );
            return points;
        },
        contains: (objects, p, quality) => {
            return objects.some((o) => o.contains(p, quality));
        },
    },
};
