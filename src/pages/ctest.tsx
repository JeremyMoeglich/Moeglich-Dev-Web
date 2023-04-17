import { useTextShape } from "~/code/funcs/use_text";
import { Point } from "~/code/types/point";
import { useMemo, useRef } from "react";
import { type DrawParams, useDraw } from "~/code/funcs/use_draw";
import { useContainerSize, useMousePosition } from "~/code/funcs/use_event";
import { RectSolid } from "~/code/types/rect_solid";
import { useMorph } from "~/code/funcs/use_morph";
import { HollowShape } from "~/code/types/hollow_shape";
import { TriangleSolid } from "~/code/types/triangle_solid";
import {
    createCircle,
    generateRoundedSquareBezier,
} from "~/code/funcs/make_shapes";
import { PolygonSolid } from "~/code/types/polygon_solid";
import { sum } from "lodash-es";
import { BezierSolid } from "~/code/types/bezier_solid";
import { PartialBezier } from "~/code/types/partial_bezier";

export default function CTest() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const text = useTextShape("e").flatMap((s) =>
        s.scale(0.5, new Point(0, -250))
    );

    // const approximate_shapes = useMemo(() => {
    //     return text.map((shape) => shape.approximated(1));
    // }, [text]);

    // const shapes = useMorph(approximate_shapes, {
    //     amount: 1,
    //     size: 0.005,
    //     speed: 0.001,
    // });

    // const to_render: TriangleSolid[] = new HollowShape(
    //     new PolygonSolid([
    //         new Point(100, 100),
    //         new Point(400, 100),
    //         new Point(400, 400),
    //         new Point(100, 400),
    //     ]),
    //     [
    //         new PolygonSolid([
    //             new Point(150, 150),
    //             new Point(350, 150),
    //             new Point(350, 350),
    //             new Point(150, 350),
    //         ]),
    //     ]
    // ).triangulate(1);

    const to_render = text;

    const container_size = useContainerSize(canvasRef);
    const rect = new RectSolid(0, 0, container_size.x, container_size.y);
    const samples = rect.distribute_grid(10000);

    const mouse_position = useMousePosition(canvasRef, "element");

    useDraw(canvasRef, [
        ...samples.map(
            (p) =>
                ({
                    action: "fill",
                    obj: p.to_circle_solid(2),
                    ctx_setter: (ctx) => {
                        const intersections = sum(
                            to_render.map((s) => s.right_point_intersections(p))
                        );
                        const color_map: Record<number, string> = {
                            0: "black",
                            1: "cyan",
                            2: "purple",
                            3: "green",
                            4: "yellow",
                            5: "magenta",
                        };
                        if (intersections < 0) {
                            ctx.fillStyle = "pink";
                        } else {
                            ctx.fillStyle = color_map[intersections] ?? "black";
                        }
                        //ctx.fillStyle = intersections % 2 === 0 ? "black" : "white";
                    },
                } satisfies DrawParams)
        ),
        {
            action: "outline",
            obj: to_render,
            debug: true,
        },
        {
            action: "fill",
            obj: mouse_position.to_circle_solid(3),
            ctx_setter: (ctx) => {
                if (to_render.some((s) => s.contains(mouse_position)))
                    ctx.fillStyle = "red";
                else ctx.fillStyle = "blue";
            },
        },
    ]);

    return (
        <div className="flex h-screen flex-col">
            <h1>Canvas Test</h1>
            <p>
                Mouse Position: {mouse_position.toString()} - Intersections:{" "}
                {sum(
                    to_render.map((s) =>
                        s.right_point_intersections(mouse_position)
                    )
                )}{" "}
                - {rect.toString()}
            </p>
            <canvas
                className="h-full w-full"
                ref={canvasRef}
                width={rect.width}
                height={rect.height}
            />
        </div>
    );
}
