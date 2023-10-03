/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from "next/router";
import { ShapeRender } from "../shapelib/funcs/shape_render";
import { Point } from "../shapelib";
import { useAnimationTime } from "~/utils/use_update";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { range } from "functional-utilities";
import { createBundle } from "../bundle";
import { useConstant } from "~/utils/use_persist";
import { makeNoise3D } from "fast-simplex-noise";
import Link from "next/link";

function useSimulation<S>(
    func: (curr: S, dt: number, t: number) => S,
    initial: S,
    speed = 1,
): S {
    const t = useAnimationTime() * speed;
    const last_t = useRef(t);
    const [state, setState] = useState(initial);

    useEffect(() => {
        const dt = t - last_t.current;
        last_t.current = t;
        setState(func(state, dt, t));
    }, [t]);

    return state;
}

function probabilisticSpawn(desiredSpawn: number) {
    const wholeNumber = Math.floor(desiredSpawn);
    const fraction = desiredSpawn - wholeNumber;

    let actualSpawn = wholeNumber;

    if (Math.random() < fraction) {
        actualSpawn++;
    }

    return actualSpawn;
}

function NavigationEntry(props: {
    name: string;
    current: boolean;
    path: string;
}) {
    const noise = useConstant(makeNoise3D());
    const points = useSimulation(
        (curr, dt, t) => {
            const amount_to_add = dt / 7;
            const to_add = range(probabilisticSpawn(amount_to_add)).map(() => ({
                pos: new Point(0, 0),
                vel: new Point(Math.random() * 2 - 1, Math.random() * 2 - 1),
                acc: new Point(0, 0),
                lifetime: 0,
            }));
            let new_points = curr.concat(to_add);
            new_points = new_points
                .map((point) => ({
                    pos: point.pos.offset(point.vel.multiply(dt / 10)),
                    vel: point.vel.offset(point.acc.multiply(dt / 10000)),
                    acc: new Point(
                        point.acc.x +
                            noise(point.pos.x * 5, point.pos.y * 5, t / 1000),
                        point.acc.y +
                            noise(point.pos.y * 5, point.pos.x * 5, t / 1000),
                    ),
                    lifetime: point.lifetime + dt,
                }))
                .filter((point) => point.lifetime < 1000);
            return new_points;
        },
        [] as {
            pos: Point;
            vel: Point;
            acc: Point;
            lifetime: number;
        }[],
        0.3,
    );
    const corner_style: CSSProperties = {
        opacity: props.current ? 0 : 1,
        transitionDuration: "0.2s",
    };
    return (
        <Link
            href={props.path}
            className="relative flex items-center justify-center border-[1px] p-3"
            style={{
                backgroundColor: props.current ? "#0077ffff" : "#04084b00",
                color: props.current ? "white" : "gray",
                transform: props.current ? "" : "skewX(-10deg)",
                transitionDuration: "0.2s",
                marginLeft: props.current ? "20px" : "0px",
                marginRight: props.current ? "20px" : "0px",
                borderColor: props.current ? "#00000000" : "#ffffffff",
            }}
        >
            {props.current && (
                <div className="l-0 t-0 absolute h-full w-full">
                    <ShapeRender
                        render_id={`navigation_entry_${props.name}`}
                        key={`navigation_entry_${props.name}`}
                        instructions={[
                            {
                                action: "both",
                                obj: createBundle(
                                    points.map((p) => {
                                        const size = 10 / p.vel.magnitude();
                                        const rand = noise(
                                            p.vel.x,
                                            p.vel.y,
                                            p.lifetime / 2000,
                                        );
                                        const opacity = rand / 2 / size ** 0.2;

                                        return p.pos
                                            .to_circle_solid(size)
                                            .set_setter((ctx) => {
                                                ctx.fillStyle = `rgba(40, 70, 250, ${opacity})`;
                                                ctx.strokeStyle = "black";
                                            });
                                    }),
                                ),
                                z_index: 0,
                            },
                        ]}
                    ></ShapeRender>
                </div>
            )}
            <div className="z-50 text-2xl">{props.name}</div>
            <div
                className="absolute right-1 top-1 h-4 w-4 border-r-2 border-t-2 border-gray-400 dark:border-white"
                style={corner_style}
            ></div>
            <div
                className="absolute bottom-1 left-1 h-4 w-4 border-b-2 border-l-2 border-gray-400 dark:border-white"
                style={corner_style}
            ></div>
            <div
                className="border-r-1 border-t-1 absolute right-1 top-1 h-2 w-2 border-gray-400 dark:border-white"
                style={corner_style}
            ></div>
            <div
                className="border-b-1 border-l-1 absolute bottom-1 left-1 h-2 w-2 border-gray-400 dark:border-white"
                style={corner_style}
            ></div>
        </Link>
    );
}

export function Header() {
    const router = useRouter();
    const path = router.pathname;
    const path_map = {
        "/": "Home",
        "/projects": "Projects",
        "/about": "About",
        "/contact": "Contact",
    };

    const current = path_map[path as keyof typeof path_map];

    return (
        <div className="hp-8 flex justify-center bg-slate-900">
            {Object.entries(path_map).map(([path, name]) => (
                <NavigationEntry
                    key={path}
                    name={name}
                    current={current === name}
                    path={path}
                ></NavigationEntry>
            ))}
        </div>
    );
}
