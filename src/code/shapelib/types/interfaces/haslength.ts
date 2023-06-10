import type { Bundler } from "~/code/bundle";
import type { Point } from "../point";

export interface HasLength {
    outline_length(): number;
    sample_on_length(min_per_unit: number, variant: "rng" | "evenly"): Point[];
    outline_intersects(other: this): boolean;
    right_point_intersections(p: Point): number;
}

export function is_HasLength(value: unknown): value is HasLength {
    return (
        (value as HasLength).outline_length !== undefined &&
        (value as HasLength).sample_on_length !== undefined &&
        (value as HasLength).outline_intersects !== undefined &&
        (value as HasLength).right_point_intersections !== undefined
    );
}

export const has_length_bundler: Bundler<HasLength, HasLength> = {
    isType: is_HasLength,
    functionality: {
        outline_length: (objects) => {
            return objects
                .map((o) => o.outline_length())
                .reduce((a, b) => a + b, 0);
        },
        sample_on_length: (objects, min_per_unit, variant) => {
            const points = objects.flatMap((o) =>
                o.sample_on_length(min_per_unit, variant)
            );
            return points;
        },
        outline_intersects: (objects, other) => {
            return objects.some((o) => o.outline_intersects(other));
        },
        right_point_intersections: (objects, p) => {
            return objects.reduce(
                (acc, o) => acc + o.right_point_intersections(p),
                0
            );
        },
    },
};
