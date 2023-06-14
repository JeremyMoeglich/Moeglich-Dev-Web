import { createBundle } from "~/code/bundle";
import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { package_visual, package_visual3d } from "./package";
import { align } from "~/code/shapelib/funcs/utils";
import {
    Point,
    PolygonSolid,
    type Renderable,
    type Transformable,
} from "~/code/shapelib";
import { default_shape_color } from "~/code/constants";
import { type Interpolate } from "~/code/funcs/interpolator";
import { zerozero } from "~/code/shapelib/types/point";
import { deg_to_rad } from "~/code/funcs/angle";

export function generics_visual(step: 0 | 1 | 2) {
    const p = {
        0: {
            s: true,
            t: 0,
        },
        1: {
            s: false,
            t: -70,
        },
        2: {
            s: false,
            t: 0,
        },
    };
    let pn = 0;
    const local_package = (e: Interpolate & Transformable & Renderable) => {
        const i = pn;
        pn++;
        return package_visual(p[step].s, `T${i}`, e, p[step].t);
    };

    return new InterFunc(({ t }: { t: number }) => {
        return align([
            local_package(
                PolygonSolid.make_ngon(6, 50)
                    .set_setter((ctx) => (ctx.fillStyle = default_shape_color))
                    .rotate(t / 1000, zerozero)
            ),
            local_package(
                PolygonSolid.make_ngon(4, 50)
                    .set_setter((ctx) => (ctx.fillStyle = default_shape_color))
                    .rotate(deg_to_rad(45))
            ),
        ]);
    });
}
