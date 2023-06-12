import { RectSolid } from "~/code/shapelib";
import { InterFunc } from "~/code/shapelib/types/InterFunc";

export function generics_visual() {
    return new InterFunc(({ t }: { t: number }) => {
        return new RectSolid(0, 0, 0, 0)
    })
}