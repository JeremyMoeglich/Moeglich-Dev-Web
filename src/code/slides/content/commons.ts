import { Point } from "~/code/shapelib";
import { InterBlock } from "~/code/shapelib/types/InterBlock";
import { Text } from "~/code/shapelib/types/text";
import { dedent } from "~/utils/dedent";

export const shape_interface = new InterBlock(
    new Text(
        dedent`
    interface Shape {
        is_inside(p: Point): boolean;
    }
`,
        new Point(0, 0),
        15
    )
        .recenter("x")
        .highlight("ts"),
    "ShapeInterface"
);
