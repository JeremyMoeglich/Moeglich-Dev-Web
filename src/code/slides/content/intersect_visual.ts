import { createBundle } from "~/code/bundle";
import { default_shape_color } from "~/code/constants";
import { deg_to_rad } from "~/code/funcs/angle";
import { type Interpolate } from "~/code/funcs/interpolator";
import {
    CircleSolid,
    PolygonSolid,
    type Renderable,
    type Transformable,
} from "~/code/shapelib";
import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { Point, zerozero } from "~/code/shapelib/types/point";
import { Text } from "~/code/shapelib/types/text";
import { dedent } from "~/utils/dedent";
import { interpolate_between } from "~/utils/interpolate_between";

export function intersect_visual(
    offset: Point,
    show_cross: boolean,
    intersect: boolean,
    impl: "class" | "func",
) {
    const cross_center_around = intersect
        ? new Point(60, -60)
        : new Point(120, -90);
    return new InterFunc(({ t }: { t: number }) => {
        const radius = interpolate_between(t / 4000, 90, 100);
        const circle = new CircleSolid(zerozero, radius).set_setter((ctx) => {
            ctx.fillStyle = default_shape_color;
        });
        const label_size = 18;
        const circle_label = new Text(
            impl === "func"
                ? dedent`
            const circle: Circle = {
                x: 0,
                y: 0,
                radius: ${radius.toFixed(2)},
            };
            `
                : dedent`
            const circle = new Circle(0, 0, ${radius.toFixed(2)});
            `,
            new Point(radius - 10, radius - 10),
            label_size,
        ).highlight("ts");

        const cross_center = new Point(
            interpolate_between(t / 1400, -60, 60),
            interpolate_between(t / 2600, -60, 60),
        )
            .multiply(intersect ? 1 : 0.4)
            .translate(cross_center_around);
        const contained = circle.contains(cross_center);
        const cross_center_label = show_cross
            ? new Text(
                  impl === "func"
                      ? `${dedent`
            const point: Point = {
                x: ${cross_center.x.toFixed(2)},
                y: ${cross_center.y.toFixed(2)},
            };
            `}\n\n${
                              !intersect
                                  ? ""
                                  : dedent`
            const inside = is_inside_circle(circle, point);
            console.log(inside); // ${contained}
            `
                          }`
                      : `${dedent`
            const point = new Point(${cross_center.x.toFixed(
                2,
            )}, ${cross_center.y.toFixed(2)});
            `}\n\n${
                              !intersect
                                  ? ""
                                  : dedent`
            const inside = circle.contains(point);
            console.log(inside); // ${contained}
            `
                          }`,
                  cross_center
                      .subtract(cross_center_around)
                      .multiply(0.2)
                      .translate(cross_center_around)
                      .translate(new Point(70, -80)),
                  label_size,
              ).highlight("ts")
            : undefined;
        const arr: (Renderable & Interpolate & Transformable)[] = [];
        arr.push(circle);
        circle_label && arr.push(circle_label);
        cross_center_label && arr.push(cross_center_label);
        arr.push(
            PolygonSolid.cross(
                cross_center,
                10,
                3,
                deg_to_rad(interpolate_between(t / 1400, 40, 50)),
            )
                .set_setter((ctx) => {
                    if (contained && intersect) {
                        ctx.fillStyle = "#ff6294";
                    } else {
                        ctx.fillStyle = "#6294ff";
                    }
                })
                .scale(
                    (contained && intersect ? 1.5 : 1) * (show_cross ? 1 : 0),
                ),
        );
        return createBundle(arr).translate(offset);
    });
}
