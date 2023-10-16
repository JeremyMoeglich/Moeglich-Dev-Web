/* eslint-disable react-hooks/exhaustive-deps */
import { makeNoise2D, makeNoise3D } from "fast-simplex-noise";
import { range, zip_longest } from "functional-utilities";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSimpleSpring } from "~/utils/spring";
import { useConstant } from "~/utils/use_persist";
import { useAnimationTime } from "~/utils/use_update";
import { Color } from "../funcs/color";
import { ShapeRender } from "../shapelib/funcs/shape_render";
import { LineSegment, Point, RectSolid } from "../shapelib";
import { seeded_rand } from "~/utils/seeded_random";
import { createBundle } from "../bundle";
import { useSimulation } from "~/utils/use_simulation";
import { create_kdtree } from "../shapelib/funcs/create_kdtree";
// import { useContainerSize } from "../funcs/use_event";

function Shift({
    parts,
    i,
    style,
}: {
    parts: (string | undefined)[];
    i: number;
    style?: React.CSSProperties;
}) {
    const parent_ref = useRef<null | HTMLSpanElement>(null);
    const [sizes, setSizes] = useState(
        parts.map((_) => ({ width: 0, height: 0 })),
    );
    const size = useSimpleSpring(sizes[i] ?? { width: 0, height: 0 });
    const smooth_i = useSimpleSpring(i);
    const max_size = sizes.reduce(
        (prev, curr) => ({
            width: Math.max(prev.width, curr.width),
            height: Math.max(prev.height, curr.height),
        }),
        { width: 0, height: 0 },
    );

    useEffect(() => {
        const spans = parent_ref.current?.children;
        if (spans === undefined) {
            return;
        }

        const bounding_rects = Array.from(spans).map((span) =>
            span.getBoundingClientRect(),
        );

        const new_sizes = bounding_rects.map(({ width, height }) => ({
            width,
            height,
        }));

        setSizes(new_sizes);
    }, [parts]);

    return (
        <span
            style={{
                display: "inline-block",
                position: "relative",
                overflow: "hidden",
                width: size.width,
                height: size.height,
                fontSize: "200px",
                fontFamily: "'Gabarito', cursive",
                ...style,
            }}
            ref={parent_ref}
        >
            {parts.map((p, index) => {
                const offset = index - smooth_i;
                return (
                    <span
                        key={index}
                        style={{
                            position: "absolute",
                            transform: `translateX(
                                ${offset * max_size.width}px
                            )`,
                        }}
                    >
                        {p}
                    </span>
                );
            })}
        </span>
    );
}

// function Fit({
//     children,
//     style,
// }: {
//     children: React.ReactNode;
//     style?: React.CSSProperties;
// }) {
//     const child_ref = useRef<null | HTMLSpanElement>(null);
//     const self_ref = useRef<null | HTMLSpanElement>(null);
//     const [scale, setScale] = useState(1);

//     const child_size = useContainerSize(child_ref);
//     const self_size = useContainerSize(self_ref);

//     useEffect(() => {
//         if (child_size.x === 0 || child_size.y === 0) {
//             return;
//         }

//         const actual_self_size = {
//             width: self_size.x / scale,
//             height: self_size.y / scale,
//         };

//         const x_factor = actual_self_size.width / child_size.x;
//         const y_factor = actual_self_size.height / child_size.y;

//         const lower = Math.min(x_factor, y_factor);

//         setScale(lower);
//     }, [child_size, self_size]);

//     return (
//         <span ref={self_ref} style={style}>
//             <span
//                 ref={child_ref}
//                 style={{
//                     display: "inline-block",
//                     transform: `scale(${scale})`,
//                     transformOrigin: "top left",
//                 }}
//             >
//                 {children}
//             </span>
//         </span>
//     );
// }

const rand = seeded_rand(123);
export function TopAnimation() {
    const words = ["moeglich.dev", "Jeremy\nMoeglich"];
    const simDomainRef = useRef(new RectSolid(0, 0, 0, 0));
    const dxnoise = useConstant(makeNoise3D(seeded_rand(125)));
    const dynoise = useConstant(makeNoise3D(seeded_rand(452)));
    const simulation = useSimulation(
        (curr, dt, t) => {
            const total_points = Math.min(
                10000,
                simDomainRef.current.area() / 100,
            );

            // // delete points outside of the domain
            let new_points = curr.filter((point) =>
                simDomainRef.current.contains(point.pos),
            );

            // Move points to the opposite edge if they go out of bounds
            // let new_points = curr.map((point) =>
            //     point.wrap(simDomainRef.current),
            // );

            const new_needed = Math.ceil(
                (total_points - new_points.length) / 100,
            );

            new_points.push(
                ...range(new_needed).map(() => ({
                    pos: new Point(
                        rand() * simDomainRef.current.width +
                            simDomainRef.current.x,
                        rand() * simDomainRef.current.height +
                            simDomainRef.current.y,
                    ),
                    lifetime: 0,
                })),
            );
            const fineness = 800;
            new_points = new_points.map((point) => ({
                pos: point.pos.offset(
                    new Point(
                        dxnoise(
                            point.pos.x / fineness,
                            point.pos.y / fineness,
                            t / 1000 + point.lifetime / 1000,
                        ),
                        dynoise(
                            point.pos.y / fineness,
                            point.pos.x / fineness,
                            t / 1000 + point.lifetime / 1000,
                        ),
                    ).multiply(4 * dt + point.lifetime / 150),
                ),
                lifetime: point.lifetime + dt,
            }));

            return new_points;
        },
        [] as {
            pos: Point;
            lifetime: number;
        }[],
        0.1,
    );

    const t = useAnimationTime();
    const i = Math.floor(t / 5000) % words.length;
    const cnoise = useConstant(makeNoise2D(seeded_rand(534)));
    const letter_parts = zip_longest(words.map((word) => word.split("")));

    const rect_func = useCallback(
        (rect: RectSolid) => {
            simDomainRef.current = rect;
            return createBundle(
                simulation.map((p) => p.pos.to_circle_solid(p.lifetime / 100)),
            ).set_setter((ctx) => {
                ctx.fillStyle = "#ffffff9c";
            });
        },
        [simulation],
    );

    const lines = useMemo(() => {
        const tree = create_kdtree(simulation.map((p) => p.pos));
        const points = simulation.map((p) => p.pos);
        const lines = points.map((point) => {
            const neighbors = tree
                .nearest(point, 5)
                .filter((p) => p[0] !== point && p[0].x < point.x);
            return neighbors.map((neighbor) =>
                new LineSegment(point, neighbor[0])
                    .to_polygon(1)
                    .set_setter((ctx) => {
                        ctx.fillStyle = `rgba(255, 255, 255, ${
                            1 - neighbor[1] / 100
                        })`;
                    }),
            );
        });
        return lines.flat();
    }, [simulation]);

    return (
        <div className="relative flex h-full flex-col items-center justify-center py-11">
            <div className="absolute h-full w-full">
                <ShapeRender
                    render_id="top_animation"
                    instructions={[
                        // {
                        //     action: "fill",
                        //     z_index: 5,
                        //     obj: new Point(0, 0)
                        //         .to_circle_solid(100)
                        //         .set_setter((ctx) => {
                        //             ctx.fillStyle = "#000000";
                        //         }),
                        // },
                        {
                            action: "fill",
                            z_index: 4,
                            obj: rect_func,
                        },
                        {
                            action: "fill",
                            z_index: 3,
                            obj: createBundle(lines),
                            origin: "global",
                        },
                    ]}
                />
            </div>
            <div className="z-40 flex flex-row">
                {letter_parts.map((parts, index) => (
                    <Shift
                        key={index}
                        parts={parts}
                        i={i}
                        style={{
                            color: Color.fromHex("#cfcfcf")
                                .interpolate(
                                    cnoise(index / 10, t / 4000),
                                    Color.fromHex("#f2f55a"),
                                )
                                .getHex(),
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
