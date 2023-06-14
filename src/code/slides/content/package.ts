import { panic } from "functional-utilities";
import { createBundle } from "~/code/bundle";
import { deg_to_rad } from "~/code/funcs/angle";
import { Interpolate } from "~/code/funcs/interpolator";
import {
    PolygonSolid,
    RectSolid,
    Renderable,
    Transformable,
} from "~/code/shapelib";
import { InterBlock } from "~/code/shapelib/types/InterBlock";
import {
    IsometricCamera,
    PerspectiveCamera,
} from "~/code/shapelib/types/camera";
import { Point, zerozero } from "~/code/shapelib/types/point";
import {
    Point3d,
    face_to_poly,
    get_cube_quads,
    z_sort_faces,
} from "~/code/shapelib/types/point3d";

export function package_visual<
    T extends Transformable & Interpolate & Renderable
>(show_top: boolean, key: string, element?: T, element_height = 0) {
    const background = PolygonSolid.make_ngon(6, 100)
        .rotate(deg_to_rad(-30))
        .set_setter((ctx) => {
            ctx.fillStyle = "#663e21"; // saddle brown
        });

    const top = new PolygonSolid([
        background.points[4] ?? panic(),
        background.points[5] ?? panic(),
        background.points[0] ?? panic(),
        zerozero,
    ]).set_setter((ctx) => {
        ctx.fillStyle = "#dd9f6d"; // sienna
    });

    const bottom_left = new PolygonSolid([
        background.points[2] ?? panic(),
        background.points[3] ?? panic(),
        background.points[4] ?? panic(),
        zerozero,
    ]).set_setter((ctx) => {
        ctx.fillStyle = "#7e431a"; // saddle brown
    });

    const bottom_right = new PolygonSolid([
        background.points[0] ?? panic(),
        background.points[1] ?? panic(),
        background.points[2] ?? panic(),
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

    return createBundle([
        new InterBlock(background, `background-${key}`),
        new InterBlock(
            (element ?? RectSolid.empty()).translate(
                new Point(0, element_height ?? 0)
            ),
            `element-${key}`
        ),
        new InterBlock(createBundle([bottom_left, bottom_right]), `bottom-${key}`),
        new InterBlock(
            createBundle([
                show_top ? top : RectSolid.empty(),
                show_top
                    ? new PolygonSolid([tp1, tp2, brp2, brp1]).set_setter(
                          (ctx) => {
                              ctx.fillStyle = "#FFFFee"; // yellow
                              ctx.globalAlpha = 0.5;
                          }
                      )
                    : RectSolid.empty(),
            ]),
            `top-${key}`
        ),
        new InterBlock(
            new PolygonSolid([brp2, blp1, blp2, brp1]).set_setter((ctx) => {
                ctx.fillStyle = "#FFFFee"; // yellow
                ctx.globalAlpha = 0.3;
            }),
            `polygon-solid-${key}`
        ),
    ]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TupleMap<T extends any[], F extends (arg: any) => any> = {
    [P in keyof T]: F extends (arg: T[P]) => infer R ? R : never;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTuple<T extends any[], F extends (arg: T[number]) => any>(
    tuple: T,
    fn: F
): TupleMap<T, F> {
    return tuple.map(fn) as TupleMap<T, F>;
}

export function default_camera(variant: "isometric" | "perspective") {
    if (variant === "isometric") {
        return new IsometricCamera(new Point3d(0, 0, 0), new Point3d(0, 0, 0));
    } else {
        const loc = new Point3d(10, 10, 5);
        const center = new Point3d(0, 0, 50);

        const pitch = Math.atan2(
            center.z - loc.z,
            Math.sqrt((loc.x - center.x) ** 2 + (loc.y - center.y) ** 2)
        );
        const yaw = Math.atan2(loc.y - center.y, loc.x - center.x);
        const rotation = new Point3d(pitch, yaw, 0);
        const aspect_ratio = 16 / 9;

        const near = 0.1;
        const far = 3000;

        const fov = 60;

        return new PerspectiveCamera(
            loc,
            rotation,
            aspect_ratio,
            near,
            far,
            fov
        );
    }
}

export function package_visual3d(t: number) {
    const size = 100;
    const cube_quads = mapTuple(get_cube_quads(size), (quad) =>
        mapTuple(quad, (point) =>
            point.rotate3d(
                new Point3d(deg_to_rad(0), deg_to_rad(0), deg_to_rad(t * 0.1)),
                new Point3d(0, 0, 0)
            )
        )
    );
    const camera = default_camera("isometric");

    const quads = [
        ...cube_quads,
        [
            cube_quads[1][0].lerp(0.4, cube_quads[1][1]),
            cube_quads[1][0].lerp(0.6, cube_quads[1][1]),
            cube_quads[1][2].lerp(0.4, cube_quads[1][3]),
            cube_quads[1][2].lerp(0.6, cube_quads[1][3]),
        ],
    ];

    const faces = z_sort_faces(quads, camera).map((face) =>
        face_to_poly(face, camera)
    );

    return createBundle(faces);
}
