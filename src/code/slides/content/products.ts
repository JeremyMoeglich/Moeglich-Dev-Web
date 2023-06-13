import { type Bundle, createBundle, emptyBundle } from "~/code/bundle";
import {
    Point,
    RectSolid,
    type Renderable,
    type Transformable,
} from "~/code/shapelib";
import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { cheese, cookie, pizza } from "./food_visual";
import { align, box } from "~/code/shapelib/funcs/utils";

export function product_visual() {
    return new InterFunc(({ t }: { t: number }) => {
        return align([box(cheese), box(pizza), box(cookie)], "vertical", 30);
    });
}
