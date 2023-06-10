import { type Bundler, createBundle, type ThisMarker } from "../../../bundle";
import type { Point } from "../point";

export interface PointMap {
    map_points(f: (p: Point) => Point): this & ThisMarker;
}

export function is_PointMap(value: unknown): value is PointMap {
    return (value as PointMap).map_points !== undefined;
}

export const point_map_bundler: Bundler<PointMap, PointMap> = {
    isType: is_PointMap,
    functionality: {
        map_points(objs, f) {
            return createBundle(objs.map((v) => v.map_points(f)));
        },
    },
};
