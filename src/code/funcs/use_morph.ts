import { useConstant } from "~/utils/use_persist";
import { Point } from "../types/point";
import { makeNoise3D } from "fast-simplex-noise";
import { useMemo } from "react";
import { useAnimationFrame } from "~/utils/use_update";



export function useMorph<T extends { map_points: (f: (p: Point) => Point) => T }>(shapes: T[], config: {
    speed: number,
    amount: number,
    size: number,
}): T[] {
    const time = useAnimationFrame();
    const xnoise = useConstant(makeNoise3D());
    const ynoise = useConstant(makeNoise3D());

    const new_shapes = useMemo(
        () =>
            shapes.map((shape) =>
                shape.map_points(
                    (p) =>
                        new Point(
                            p.x +
                            xnoise(
                                p.x * config.size,
                                p.y * config.size,
                                time * config.speed
                            ) *
                            config.amount,

                            p.y +
                            ynoise(
                                p.x * config.size,
                                p.y * config.size,
                                time * config.speed
                            ) *
                            config.amount
                        )
                )
            ),
        [shapes, time, xnoise, ynoise, config]
    );

    return new_shapes;
}