import { createBundle } from "~/code/bundle";
import { rad_to_deg } from "~/code/funcs/angle";
import { Color } from "~/code/funcs/color";
import { CircleSolid, PolygonSolid, RectSolid } from "~/code/shapelib";
import { syncTextToShapes } from "~/code/shapelib/funcs/text_to_shape";
import { align, box } from "~/code/shapelib/funcs/utils";
import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { Point, zerozero } from "~/code/shapelib/types/point";
import { Text } from "~/code/shapelib/types/text";
import { dedent } from "~/utils/dedent";
import { interpolate_between } from "~/utils/interpolate_between";

export function transforms_visual(
    rotate: (t: number) => number,
    scale: (t: number) => number,
    show_code: boolean,
    opt: {
        only_triangle?: boolean;
    }
) {
    return new InterFunc(({ t }: { t: number }) => {
        const shapes = [
            [PolygonSolid.make_ngon(3, 50), "Triangle"],
            [PolygonSolid.make_ngon(4, 50), "Square"],
            [PolygonSolid.make_ngon(6, 50), "Hexagon"],
            [new CircleSolid(zerozero, 50), "Circle"],
            [syncTextToShapes("Test").scale(0.03), "Text"],
        ] satisfies [any, string][];

        const label = new Text(
            `Rotate: ${(rad_to_deg(rotate(t)) % 360).toFixed(
                2
            )}°\nScale: ${scale(t).toFixed(2)}`,
            zerozero,
            show_code ? 30 : 40
        ).set_setter((ctx) => {
            ctx.fillStyle = "white";
        });

        const code = new Text(
            dedent`
                const shapes = [
                    new Triangle(),
                    new Square(),
                    new Hexagon(),
                    new Circle(),
                    new Text("Test"),
                ];
            `,
            zerozero,
            30
        )
            .highlight("ts")
            .recenter("both")
            .scale(1.3);

        return createBundle([
            align(
                shapes
                    .filter((s) =>
                        opt.only_triangle ? s[1] === "Triangle" : true
                    )
                    .map((s) => {
                        return align(
                            [
                                box(
                                    s[0]
                                        .rotate(rotate(t))
                                        .scale(scale(t))
                                        .set_setter((ctx) => {
                                            ctx.fillStyle = "#c0ee84";
                                        }),
                                    {
                                        min_height: 150,
                                        min_width: 150,
                                        rounded: 20,
                                        color: new Color(60, 60, 120),
                                    }
                                ),
                                new Text(s[1], zerozero, 28).set_setter(
                                    (ctx) => {
                                        ctx.fillStyle = "white";
                                    }
                                ),
                            ],
                            show_code
                                ? {
                                      direction: "horizontal",
                                      size: 350,
                                      method: "evenly",
                                  }
                                : {
                                      direction: "vertical",
                                      gap: 10,
                                      method: "equal_gap",
                                  }
                        );
                    }),
                {
                    direction: show_code ? "vertical" : "horizontal",
                    gap: 50,
                    method: "equal_gap",
                }
            )
                .scale(show_code ? 0.8 : 1.5)
                .translate(show_code ? new Point(-740, 0) : zerozero),
            label
                .recenter("x")
                .translate(
                    show_code ? new Point(-400, 300) : new Point(0, 250)
                ),
        ]);
    });
}
