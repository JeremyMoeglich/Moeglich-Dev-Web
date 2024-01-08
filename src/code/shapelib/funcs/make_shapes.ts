import { Point } from "../types/point";
import { PartialBezier } from "../types/partial_bezier";
import { BezierSolid } from "../types/bezier_solid";

export function generateRoundedSquareBezier(
    offset: Point,
    width: number,
    height: number,
    rounded_amount: number,
): BezierSolid {
    // defines a square with rounded corners using 8 bezier curves 4 for each corner 4 for each side
    const bezierArray: PartialBezier[] = [];

    // top edge
    bezierArray.push(
        new PartialBezier(
            new Point(offset.x + rounded_amount, offset.y),
            new Point(offset.x + width - rounded_amount, offset.y),
            new Point(offset.x + width - rounded_amount, offset.y),
        ),
    );

    // top right corner
    bezierArray.push(
        new PartialBezier(
            new Point(offset.x + width, offset.y),
            new Point(offset.x + width, offset.y),
            new Point(offset.x + width, offset.y + rounded_amount),
        ),
    );

    // right edge
    bezierArray.push(
        new PartialBezier(
            new Point(offset.x + width, offset.y + rounded_amount),
            new Point(offset.x + width, offset.y + height - rounded_amount),
            new Point(offset.x + width, offset.y + height - rounded_amount),
        ),
    );

    // bottom right corner
    bezierArray.push(
        new PartialBezier(
            new Point(offset.x + width, offset.y + height),
            new Point(offset.x + width, offset.y + height),
            new Point(offset.x + width - rounded_amount, offset.y + height),
        ),
    );

    // bottom edge
    bezierArray.push(
        new PartialBezier(
            new Point(offset.x + width - rounded_amount, offset.y + height),
            new Point(offset.x + rounded_amount, offset.y + height),
            new Point(offset.x + rounded_amount, offset.y + height),
        ),
    );

    // bottom left corner
    bezierArray.push(
        new PartialBezier(
            new Point(offset.x, offset.y + height),
            new Point(offset.x, offset.y + height),
            new Point(offset.x, offset.y + height - rounded_amount),
        ),
    );

    // left edge
    bezierArray.push(
        new PartialBezier(
            new Point(offset.x, offset.y + height - rounded_amount),
            new Point(offset.x, offset.y + rounded_amount),
            new Point(offset.x, offset.y + rounded_amount),
        ),
    );

    // top left corner
    bezierArray.push(
        new PartialBezier(
            new Point(offset.x, offset.y),
            new Point(offset.x, offset.y),
            new Point(offset.x + rounded_amount, offset.y),
        ),
    );

    return new BezierSolid(bezierArray);
}
