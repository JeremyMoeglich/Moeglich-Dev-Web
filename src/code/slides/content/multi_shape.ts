import { createBundle } from "~/code/bundle";
import { default_shape_color } from "~/code/constants";
import { type Interpolate } from "~/code/funcs/interpolator";
import {
    CircleSolid,
    Point,
    PolygonSolid,
    type Renderable,
    type Transformable,
} from "~/code/shapelib";
import { syncTextToShapes } from "~/code/shapelib/funcs/text_to_shape";
import { InterBlock } from "~/code/shapelib/types/InterBlock";
import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { zerozero } from "~/code/shapelib/types/point";
import { Text } from "~/code/shapelib/types/text";
import { dedent } from "~/utils/dedent";
import { interpolate_between } from "~/utils/interpolate_between";
import { shape_interface } from "./commons";
import { Color } from "~/code/funcs/color";

export function multi_shape_visual(
    labels: boolean,
    show_common: boolean,
    colors: "abstract_inherit" | "inherit" | "local" | "none"
) {
    return new InterFunc(({ t }: { t: number }) => {
        const size = interpolate_between(t / 3000, 40, 50);
        const gap = 270;
        const angle = t / 1000;
        const gap_offset = (n: number) => new Point(n, 0);
        const color_gen = (n: number) =>
            new Color(255, 140, 140).shift_hue(120 * n + t / 30);
        const shape_offset = labels ? new Point(0, -50) : zerozero;
        const label_offset = new Point(0, 20);
        const shapes: (Renderable & Interpolate & Transformable)[] = [
            PolygonSolid.make_ngon(3, size)
                .set_setter(
                    (ctx) =>
                        (ctx.fillStyle =
                            colors === "none"
                                ? default_shape_color
                                : color_gen(0).getHex())
                )
                .translate(gap_offset(-gap))
                .translate(shape_offset)
                .rotate(angle),
            new CircleSolid(new Point(0, 0), size)
                .set_setter(
                    (ctx) =>
                        (ctx.fillStyle =
                            colors === "none"
                                ? default_shape_color
                                : color_gen(1).getHex())
                )
                .translate(shape_offset),
            syncTextToShapes("Test")
                .scale(0.03)
                .recenter("both")
                .set_setter(
                    (ctx) =>
                        (ctx.fillStyle =
                            colors === "none"
                                ? default_shape_color
                                : color_gen(2).getHex())
                )
                .translate(gap_offset(gap).translate(shape_offset))
                .rotate(interpolate_between(t / 3000, -0.2, 0.2)),
        ];
        const color_def = colors === "local" ? "\n    color: Color" : "";
        const keyword =
            colors === "inherit"
                ? "extends"
                : colors === "abstract_inherit"
                ? "extends"
                : "implements";
        labels &&
            shapes.push(
                new InterBlock(
                    new Text(
                        dedent`
class Triangle ${show_common ? `${keyword} Shape ` : ""}${color_def}
    p1: Point;
    p2: Point;
    p3: Point;

    is_inside(p: Point): boolean {
        // ...
    }
}
                `,
                        label_offset,
                        10
                    )
                        .recenter("x")
                        .translate(gap_offset(-gap))
                        .highlight("ts"),
                    "Triangle"
                )
            );
        labels &&
            shapes.push(
                new InterBlock(
                    new Text(
                        dedent`
class Circle ${show_common ? `${keyword} Shape ` : ""}${color_def}
    x: number;
    y: number;
    radius: number;

    is_inside(p: Point): boolean {
        // ...
    }
}
                `,
                        label_offset,
                        10
                    )
                        .recenter("x")
                        .highlight("ts"),
                    "Circle"
                )
            );
        labels &&
            shapes.push(
                new InterBlock(
                    new Text(
                        dedent`
class Text ${show_common ? `${keyword} Shape ` : ""}{${color_def}
    text: string;
    x: number;
    y: number;
    size: number;

    is_inside(p: Point): boolean {
        // ...
    }
}
                `,
                        label_offset,
                        10
                    )
                        .recenter("x")
                        .translate(gap_offset(gap))
                        .highlight("ts"),
                    "Text"
                )
            );
        show_common &&
            shapes.push(
                new Text(
                    shape_interface({
                        variant:
                            colors === "inherit"
                                ? "class"
                                : colors === "abstract_inherit"
                                ? "abstract_class"
                                : "interface",
                        color: true,
                        is_inside: true,
                    }),
                    zerozero,
                    15
                )
                    .recenter("both")
                    .highlight("ts")
                    .translate(label_offset)
                    .translate(new Point(0, -250))
            );
        return createBundle(shapes)
            .scale(!show_common ? 2 : 1.5, zerozero)
            .translate(show_common ? new Point(0, 100) : new Point(0, 0));
    });
}
