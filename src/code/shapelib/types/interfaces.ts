import type { LineSegment } from "./line_segment";
import type { Point } from "./point";
import type { PolygonSolid } from "./polygon_solid";
import type { RectSolid } from "./rect_solid";
import type { ShapeSet } from "./shape_set";
import type { TriangleSolid } from "./triangle_solid";

export interface PointMap {
    map_points(f: (p: Point) => Point): this;
}

export type Axis = "x" | "y" | "both";

export interface Stringifiable {
    toString(): string;
}

export interface Transformable extends BoundingBox {
    translate(offset: Point): this;
    flip(axis: Axis): this;
    rotate(angle: number, origin?: Point): this; // origin is infered as center of bbox
    scale(scale: number, origin?: Point): this; // origin is infered as center of bbox
}

export interface BoundingBox {
    bbox(): RectSolid;
}

export type CanvasStyle =
    | typeof CanvasRenderingContext2D.prototype.fillStyle
    | typeof CanvasRenderingContext2D.prototype.strokeStyle;

export interface Renderable extends RenderableDebug, RenderableOutline {
    render_fill(ctx: CanvasRenderingContext2D): void;
}

export interface RenderableOutline extends RenderableDebug {
    render_outline(ctx: CanvasRenderingContext2D): void;
    select_shape(ctx: CanvasRenderingContext2D): void;
}

export interface RenderableDebug {
    render_debug(ctx: CanvasRenderingContext2D): void;
}

export interface HasArea extends BoundingBox {
    area(): number;
    triangulate(quality: number): ShapeSet<TriangleSolid>; // refer to approximated() for quality conventions
    sample_on_area(min_per_unit: number, variant: "min" | "rng"): Point[];
    contains(p: Point, quality: number): boolean; // refer to approximated() for quality conventions
}

export interface HasLength {
    outline_length(): number;
    sample_on_length(min_per_unit: number, variant: "rng" | "evenly"): Point[];
    outline_intersects(other: this): boolean;
    right_point_intersections(p: Point): number;
}

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
        other: this
    ):
        | "this_inside_other"
        | "other_inside_this"
        | "outline_intersect"
        | "disjoint";
    intersects(other: this): boolean;
}

export interface Shape
    extends Transformable,
        Stringifiable,
        HasArea,
        HasLength,
        Renderable {
    center(): Point;
    recenter(axis: Axis): this;
}

export interface Curve
    extends RenderableOutline,
        Transformable,
        BoundingBox,
        HasLength {}

export interface HasVertices {
    vertices(): Point[];
    lines(): LineSegment[];
}
