import { panic } from "functional-utilities";
import { createBundle } from "~/code/bundle";
import { deg_to_rad } from "~/code/funcs/angle";
import { PolygonSolid } from "~/code/shapelib";
import { zerozero } from "~/code/shapelib/types/point";

export function package_visual() {
    const background = PolygonSolid.make_ngon(6, 100)
        .rotate(deg_to_rad(-30))
        .set_setter((ctx) => {
            ctx.fillStyle = "#8B4513"; // saddle brown
        });

    const top = new PolygonSolid([
        background.points[0] ?? panic(),
        background.points[1] ?? panic(),
        background.points[2] ?? panic(),
        zerozero,
    ]).set_setter((ctx) => {
        ctx.fillStyle = "#A0522D"; // sienna
    });

    const bottom_right = new PolygonSolid([
        background.points[2] ?? panic(),
        background.points[3] ?? panic(),
        background.points[4] ?? panic(),
        zerozero,
    ]).set_setter((ctx) => {
        ctx.fillStyle = "#8B4513"; // saddle brown
    });

    const bottom_left = new PolygonSolid([
        background.points[4] ?? panic(),
        background.points[5] ?? panic(),
        background.points[0] ?? panic(),
        zerozero,
    ]).set_setter((ctx) => {
        ctx.fillStyle = "#CD853F"; // peru
    });

    const tp1 = (background.points[4] ?? panic()).lerp(
        0.4,
        background.points[5] ?? panic()
    );
    const tp2 = (background.points[4] ?? panic()).lerp(
        0.6,
        background.points[5] ?? panic()
    );
    const brp1 = (background.points[0] ?? panic()).lerp(
        0.6,
        zerozero ?? panic()
    );
    const brp2 = (background.points[0] ?? panic()).lerp(
        0.4,
        zerozero ?? panic()
    );
    const blp1 = (background.points[1] ?? panic()).lerp(
        0.4,
        background.points[2] ?? panic()
    );
    const blp2 = (background.points[1] ?? panic()).lerp(
        0.6,
        background.points[2] ?? panic()
    );

    const tape = new PolygonSolid([
        tp1,
        tp2,
        brp2,
        blp1,
        blp2,
        brp1,
    ]).set_setter((ctx) => {
        ctx.fillStyle = "#FFFFee"; // yellow
        ctx.globalAlpha = 0.3
    });

    return createBundle([background, top, bottom_right, bottom_left, tape]);
}
