import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { cheese, cookie, pizza } from "./end_visual";
import { box, table } from "~/code/shapelib/funcs/utils";
import { Point, zerozero } from "~/code/shapelib/types/point";
import { Color } from "~/code/funcs/color";
import { Text } from "~/code/shapelib/types/text";
import { RectSolid } from "~/code/shapelib";

export function product_visual(opt: { name: boolean; price: boolean }) {
    return new InterFunc(({ t }: { t: number }) => {
        return table(
            (
                [
                    [cheese, "Käse", 3],
                    [pizza.scale(1.5), "Pizza", 2],
                    [cookie.scale(1.4), "Keks", 1],
                ] satisfies [unknown, unknown, unknown][]
            ).map(([e, ename, eprice]) => [
                box(e.rotate(t / 2000, zerozero), {
                    rounded: 10,
                    min_width: 400,
                    min_height: 400,
                    color: Color.fromHex("#343949"),
                }),
                opt.name ? new Text(ename, zerozero, 40) : RectSolid.empty(),
                opt.price
                    ? new Text(`${eprice.toFixed(0)}€`, zerozero, 40)
                    : RectSolid.empty(),
            ]),
            [300, 100, 50],
            [450, 450, 450],
        )
            .translate(new Point(300, 0))
            .scale(0.7);
    });
}
