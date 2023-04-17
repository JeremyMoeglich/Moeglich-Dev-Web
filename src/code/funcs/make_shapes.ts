import { cyclic_pairs } from "functional-utilities";
import { Point } from "../types/point";
import { PartialBezier } from "../types/partial_bezier";
import { BezierSolid } from "../types/bezier_solid";
import { HollowShape } from "../types/hollow_shape";
import type { PolygonSolid } from "../types/polygon_solid";

export function generateRoundedSquareBezier(offset: Point, width: number, height: number, rounded_amount: number): BezierSolid {
    // defines a square with rounded corners using 8 bezier curves 4 for each corner 4 for each side
    const bezierArray: PartialBezier[] = [];

    // top edge
    bezierArray.push(new PartialBezier(
        new Point(offset.x + rounded_amount, offset.y),
        new Point(offset.x + width - rounded_amount, offset.y),
        new Point(offset.x + width - rounded_amount, offset.y),
    ));

    // top right corner
    bezierArray.push(new PartialBezier(
        new Point(offset.x + width, offset.y),
        new Point(offset.x + width, offset.y),
        new Point(offset.x + width, offset.y + rounded_amount),
    ));

    // right edge
    bezierArray.push(new PartialBezier(
        new Point(offset.x + width, offset.y + rounded_amount),
        new Point(offset.x + width, offset.y + height - rounded_amount),
        new Point(offset.x + width, offset.y + height - rounded_amount),
    ));

    // bottom right corner
    bezierArray.push(new PartialBezier(
        new Point(offset.x + width, offset.y + height),
        new Point(offset.x + width, offset.y + height),
        new Point(offset.x + width - rounded_amount, offset.y + height),
    ));

    // bottom edge
    bezierArray.push(new PartialBezier(
        new Point(offset.x + width - rounded_amount, offset.y + height),
        new Point(offset.x + rounded_amount, offset.y + height),
        new Point(offset.x + rounded_amount, offset.y + height),
    ));

    // bottom left corner
    bezierArray.push(new PartialBezier(
        new Point(offset.x, offset.y + height),
        new Point(offset.x, offset.y + height),
        new Point(offset.x, offset.y + height - rounded_amount),
    ));

    // left edge
    bezierArray.push(new PartialBezier(
        new Point(offset.x, offset.y + height - rounded_amount),
        new Point(offset.x, offset.y + rounded_amount),
        new Point(offset.x, offset.y + rounded_amount),
    ));

    // top left corner
    bezierArray.push(new PartialBezier(
        new Point(offset.x, offset.y),
        new Point(offset.x, offset.y),
        new Point(offset.x + rounded_amount, offset.y),
    ));

    return new BezierSolid(bezierArray);
}

export function polygonToBezier(polygon: PolygonSolid): BezierSolid {
    const bezierArray: PartialBezier[] = [];
    if (polygon.points.length === 0) return new BezierSolid(bezierArray);

    // Loop through all the points in the polygon
    for (const [prev, next] of cyclic_pairs(polygon.points)) {
        const handle1 = new Point(
            prev.x + (next.x - prev.x) / 3,
            prev.y + (next.y - prev.y) / 3,
        );
        const handle2 = new Point(
            next.x - (next.x - prev.x) / 3,
            next.y - (next.y - prev.y) / 3,
        );

        // Add a new Bezier curve to the array
        bezierArray.push(new PartialBezier(handle1, handle2, next));
    }

    return new BezierSolid(bezierArray);
}

export function polygonShapeToShape(polygon: HollowShape<PolygonSolid>): HollowShape<BezierSolid> {
    return new HollowShape(
        polygonToBezier(polygon.exterior),
        polygon.holes.map(polygonToBezier),
    );
}

export function createCircle(c: Point, r: number): BezierSolid {
    const kappa = 4 * ((Math.sqrt(2) - 1) / 3);
    const x = c.x;
    const y = c.y;

    const bezierArray: PartialBezier[] = [];

    const handleLength = r * kappa;

    bezierArray.push(new PartialBezier(
        new Point(x + handleLength, y + r),
        new Point(x + r, y + handleLength),
        new Point(x + r, y),
    ));

    bezierArray.push(new PartialBezier(
        new Point(x + r, y - handleLength),
        new Point(x + handleLength, y - r),
        new Point(x, y - r),
    ));

    bezierArray.push(new PartialBezier(
        new Point(x - handleLength, y - r),
        new Point(x - r, y - handleLength),
        new Point(x - r, y),
    ));

    bezierArray.push(new PartialBezier(
        new Point(x - r, y + handleLength),
        new Point(x - handleLength, y + r),
        new Point(x, y + r),
    ));

    return new BezierSolid(bezierArray);
}
