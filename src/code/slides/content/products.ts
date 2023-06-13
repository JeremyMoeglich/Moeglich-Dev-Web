import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { cheese, cookie, pizza } from "./food_visual";
import { align, box } from "~/code/shapelib/funcs/utils";
import { zerozero } from "~/code/shapelib/types/point";

export function product_visual() {
    return new InterFunc(({ t }: { t: number }) => {
        return align(
            [cheese, pizza, cookie].map((e) =>
                box(e.rotate(t / 2000, zerozero), {
                    rounded: 10,
                    min_width: 400,
                    min_height: 400,
                })
            ),
            {
                direction: "vertical",
                gap: 20,
                method: "equal_gap",
            }
        );
    });
}
