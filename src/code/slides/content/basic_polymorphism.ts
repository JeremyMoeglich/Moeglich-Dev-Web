import { createBundle } from "~/code/bundle";
import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { shape_interface } from "./commons";
import { Point } from "~/code/shapelib";
import { Text } from "~/code/shapelib/types/text";
import { zerozero } from "~/code/shapelib/types/point";
import { dedent } from "~/utils/dedent";

export function basic_polymorphism(i: number) {
    const segments = [
        shape_interface({
            color: false,
            variant: "interface",
            is_inside: true,
        }),
        dedent`
        const shapes: Shape[] = [
            new Circle(0, 0, 10),
            new Rectangle(0, 0, 10, 10),
            new Triangle(
                new Point(0, 0),
                new Point(10, 0),
                new Point(0, 10)
            )
        ];
    `,
        dedent`
        for (const shape of shapes) {
            console.log(shape.is_inside(new Point(5, 5)));
        }
    `,
    ];

    const code = segments.slice(0, i).join("\n\n");
    const text = new Text(code, zerozero, 15).highlight("ts");
    const final_height = 500;
    const text_bbox = text.bbox();
    const scaley = final_height / text_bbox.height;
    return new InterFunc(({ t }: { t: number }) => {
        return createBundle([
            text.translate(new Point(-500, -100)).scale(scaley),
        ]);
    });
}
