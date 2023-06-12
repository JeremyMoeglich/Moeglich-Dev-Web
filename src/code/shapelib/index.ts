import { BezierSolid } from "./types/bezier_solid";
import { CircleSolid } from "./types/circle_solid";
import { FullBezier } from "./types/full_bezier";
import { HollowShape } from "./types/hollow_shape";
import type { Axis, CanvasStyle } from "./types/types";
import { LineSegment } from "./types/line_segment";
import { PartialBezier } from "./types/partial_bezier";
import { Point } from "./types/point";
import { PolygonSolid } from "./types/polygon_solid";
import { RectSolid } from "./types/rect_solid";
import { TriangleSolid } from "./types/triangle_solid";
import { type BoundingBox } from "./types/interfaces/boundingbox";
import { type HasArea } from "./types/interfaces/hasarea";
import { type HasLength } from "./types/interfaces/haslength";
import { type HasVertices } from "./types/interfaces/hasvertices";
import { type Renderable } from "./types/interfaces/renderable";
import { type SolidShape } from "./types/interfaces/solidshape";
import { type Shape } from "./types/interfaces/shape";
import { type Stringifiable } from "./types/interfaces/stringifiable";
import { type Transformable } from "./types/interfaces/transformable";
import { type PointMap } from "./types/interfaces/pointmap";

export {
    BezierSolid,
    CircleSolid,
    FullBezier,
    HollowShape,
    LineSegment,
    PartialBezier,
    Point,
    PolygonSolid,
    RectSolid,
    TriangleSolid,
};

export type {
    Axis,
    BoundingBox,
    HasArea,
    HasLength,
    HasVertices,
    PointMap,
    Renderable,
    CanvasStyle,
    SolidShape,
    Shape,
    Stringifiable,
    Transformable,
};
