import { type UnMarkThis } from "~/code/bundle";
import type { PolygonSolid } from "../polygon_solid";
import { type Shape, is_Shape } from "./shape";

export interface SolidShape extends Shape {
    approximated(quality: number): PolygonSolid; // what quality is depends on the shape
    // Here are some conventions for quality:
    // - 0: lowest possible quality, shape might be gone completely
    // - 1: a circle might be approximated by a triangle
    // - 2: a circle might be approximated by a hexagon
    // - 3: a circle might be approximated by a 12-gon
    // - 4: a circle might be approximated by a 24-gon
    // and so on, the higher the quality, the more vertices the shape will have
    // Note that not every function using quality will need it at all, so it might be ignored for some shapes

    relation_to(
        other: UnMarkThis<this>
    ):
        | "this_inside_other"
        | "other_inside_this"
        | "outline_intersect"
        | "disjoint";
    intersects(other: UnMarkThis<this>): boolean;
}

export function is_SolidShape(value: unknown): value is SolidShape {
    return (
        (value as SolidShape).approximated !== undefined &&
        (value as SolidShape).relation_to !== undefined &&
        (value as SolidShape).intersects !== undefined &&
        is_Shape(value)
    );
}
