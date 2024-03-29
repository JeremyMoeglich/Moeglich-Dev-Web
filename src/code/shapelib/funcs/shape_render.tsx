"use client";

// useDraw takes a ref to a canvas and an array of renderable objects and draws them to the canvas

import React, { useEffect, useRef, useContext, useMemo } from "react";

import { Point } from "../types/point";
import { RectSolid } from "../types/rect_solid";
import { panic } from "functional-utilities";
import { type Renderable } from "../types/interfaces/renderable";
import { type Transformable } from "../types/interfaces/transformable";
import { type BoundingBox } from "../types/interfaces/boundingbox";
import { useEvent } from "~/code/funcs/use_event";
import { maybe_window } from "~/utils/maybe_window";

export type DrawParams = {
    debug?: boolean;
    z_index: number;
    shape_id?: string;
    origin?: "local" | "global";
    obj:
        | (Renderable & Transformable & BoundingBox)
        | ((func: RectSolid) => Renderable & Transformable & BoundingBox);
    action: "fill" | "stroke" | "both";
    clip?: RectSolid | "none" | undefined;
};

interface RenderedShape {
    shape_id: string;
    bbox: RectSolid;
    redraw: (ctx: CanvasRenderingContext2D) => void;
    z_index: number;
}

const rendered_shapes: Map<string, RenderedShape> = new Map();

function rerender(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const shapes = Array.from(rendered_shapes.values());
    shapes.sort((a, b) => a.z_index - b.z_index);
    for (const shape of shapes) {
        shape.redraw(ctx);
    }
}

let rerenderScheduled = false;

const SingleShapeRender: React.FC<DrawParams & { shape_id: string }> = ({
    obj,
    action,
    debug = false,
    shape_id,
    z_index,
    clip,
}) => {
    const canvasRef = useContext(CanvasContext);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        const true_obj = obj as Renderable & Transformable & BoundingBox;
        rendered_shapes.set(shape_id, {
            bbox: true_obj.bbox(),
            shape_id,
            z_index,
            redraw: (ctx: CanvasRenderingContext2D) => {
                ctx.lineWidth = 1;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.fillStyle = "blue";
                ctx.strokeStyle = "green";
                ctx.globalAlpha = 1;

                ctx.save();
                ctx.beginPath();
                if (clip !== "none") {
                    if (!clip) {
                        panic("No clip");
                    }
                    clip.select_shape(ctx);
                    ctx.clip();
                }

                if (action === "fill" || action === "both") {
                    true_obj.render(ctx, "fill");
                } else if (action === "stroke" || action === "both") {
                    true_obj.render(ctx, "stroke");
                }
                if (debug) {
                    true_obj.render_debug(ctx);
                }

                ctx.restore();
            },
        });
        if (!rerenderScheduled) {
            rerenderScheduled = true;
            requestAnimationFrame(() => {
                const ctx =
                    canvasRef.current?.getContext("2d") ?? panic("No context");
                rerender(ctx);
                rerenderScheduled = false;
            });
        }

        return () => {
            const canvas = canvasRef.current;
            if (canvas) {
                rendered_shapes.delete(shape_id);
                if (!rerenderScheduled) {
                    rerenderScheduled = true;
                    requestAnimationFrame(() => {
                        const ctx =
                            canvas.getContext("2d") ?? panic("No context");
                        rerender(ctx);
                        rerenderScheduled = false;
                    });
                }
            }
        };
    }, [obj, action, debug, shape_id, z_index, canvasRef, clip]);

    return null;
};

export const ShapeRender: React.FC<
    | {
          instructions: DrawParams[];
          render_id: string;
      }
    | {
          instructions: (DrawParams & { shape_id: string })[];
      }
> = (props) => {
    const shapeRef = useRef<HTMLDivElement | null>(null);
    const { instructions } = props;
    const render_id = "render_id" in props ? props.render_id : undefined;

    const updated_instructions: DrawParams[] = useMemo(() => {
        // Calculate the offset from the top of the document, accounting for scroll position
        if (shapeRef.current) {
            const rect = shapeRef.current.getBoundingClientRect();
            const rect_center = new Point(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
            );
            const scrollTop =
                window.scrollY ?? document.documentElement.scrollTop;
            const scrollLeft =
                window.scrollX ?? document.documentElement.scrollLeft;
            const offset = new Point(scrollLeft, scrollTop).translate(
                rect_center,
            );
            const clip = RectSolid.from_corners(
                new Point(-rect.width / 2, -rect.height / 2),
                new Point(rect.width / 2, rect.height / 2),
            ).translate(offset);

            const inst = instructions.map((instruction) => {
                const eval_clip =
                    typeof instruction.clip === "object"
                        ? instruction.clip
                        : clip;

                const true_obj =
                    typeof instruction.obj === "function"
                        ? instruction.obj(eval_clip)
                        : instruction.obj;
                const transformed =
                    instruction.origin === "global" ||
                    typeof instruction.obj === "function"
                        ? true_obj
                        : true_obj.translate(offset);

                return {
                    ...instruction,
                    obj: transformed,
                    clip: instruction.clip ?? clip,
                };
            });

            return inst;
        }
        return [];
    }, [instructions]);
    // We use an invisible div to get the position of the ShapeRender component
    return (
        <div
            ref={shapeRef}
            className="pointer-events-none absolute left-0 top-0 h-full w-full"
        >
            {updated_instructions.map((instruction, i) => {
                const id =
                    instruction.shape_id ?? `${render_id ?? panic()}-${i}`;
                return (
                    <SingleShapeRender
                        key={id}
                        action={instruction.action}
                        obj={instruction.obj}
                        shape_id={id}
                        z_index={instruction.z_index}
                        debug={instruction.debug}
                        clip={instruction.clip}
                    />
                );
            })}
        </div>
    );
};

interface ShapeRenderProviderProps {
    children: React.ReactNode;
}

export const CanvasContext = React.createContext<
    React.MutableRefObject<HTMLCanvasElement | null>
>({ current: null });

export const ShapeRenderProvider: React.FC<ShapeRenderProviderProps> = ({
    children,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    function resize() {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            rerender(canvasRef.current.getContext("2d") ?? panic("No context"));
        }
    }

    useEvent(maybe_window(), "resize", resize, undefined);
    // biome-ignore lint/correctness/useExhaustiveDependencies:
    useEffect(() => {
        resize();
    }, [canvasRef]);

    return (
        <CanvasContext.Provider value={canvasRef}>
            <canvas
                ref={canvasRef}
                className="pointer-events-none absolute z-30"
            />
            {children}
        </CanvasContext.Provider>
    );
};
