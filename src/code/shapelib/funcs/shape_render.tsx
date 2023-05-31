// useDraw takes a ref to a canvas and an array of renderable objects and draws them to the canvas

import React, { useEffect, useRef, useContext, useMemo } from "react";
import type {
    BoundingBox,
    Renderable,
    RenderableOutline,
    Transformable,
} from "../types/interfaces";
import { Point } from "../types/point";
import type { RectSolid } from "../types/rect_solid";
import { panic } from "functional-utilities";

export type DrawParams = {
    debug?: boolean;
    ctx_setter?: (ctx: CanvasRenderingContext2D) => void;
    z_index: number;
    shape_id?: string;
    origin?: "local" | "global";
} & (
    | {
          obj: Renderable & Transformable & BoundingBox;
          action: "fill" | "both";
      }
    | {
          obj: RenderableOutline & Transformable & BoundingBox;
          action: "outline";
      }
);

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
    shapes.forEach((shape) => shape.redraw(ctx));
}

let rerenderScheduled = false;

const SingleShapeRender: React.FC<DrawParams & { shape_id: string }> = ({
    obj,
    action,
    debug = false,
    ctx_setter,
    shape_id,
    z_index,
}) => {
    const canvasRef = useContext(CanvasContext);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }
        rendered_shapes.set(shape_id, {
            bbox: obj.bbox(),
            shape_id,
            z_index,
            redraw: (ctx: CanvasRenderingContext2D) => {
                ctx.lineWidth = 1;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.fillStyle = "blue";
                ctx.strokeStyle = "green";
                ctx.globalAlpha = 1;

                if (ctx_setter) {
                    ctx_setter(ctx);
                }
                if (ctx.globalAlpha !== 0) {
                    if (action === "outline" || action === "both") {
                        obj.render_outline(ctx);
                    }
                    if (action === "fill" || action === "both") {
                        obj.render_fill(ctx);
                    }
                }
                if (debug) {
                    obj.render_debug(ctx);
                }
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
            // eslint-disable-next-line react-hooks/exhaustive-deps
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
    }, [canvasRef, obj, action, debug, ctx_setter, shape_id, z_index]);

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
                rect.top + rect.height / 2
            );
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
            const scrollLeft =
                window.scrollX || document.documentElement.scrollLeft;
            const offset = new Point(scrollLeft, scrollTop).translate(
                rect_center
            );
            // Now you can use this offset in your drawing logic
            return instructions.map((instruction) => {
                if (instruction.origin === "global") return instruction;
                if (instruction.action === "outline") {
                    return {
                        ...instruction,
                        obj: instruction.obj.translate(offset),
                    };
                } else {
                    return {
                        ...instruction,
                        obj: instruction.obj.translate(offset),
                    };
                }
            });
        }
        return instructions;
    }, [shapeRef, instructions]);
    // We use an invisible div to get the position of the ShapeRender component
    return (
        <div
            ref={shapeRef}
            className="pointer-events-none absolute left-0 top-0 h-full w-full"
        >
            {updated_instructions.map((instruction, i) => {
                const id =
                    instruction.shape_id ?? `${render_id ?? panic()}-${i}`;
                if (instruction.action === "outline") {
                    return (
                        <SingleShapeRender
                            key={id}
                            action="outline"
                            obj={instruction.obj}
                            shape_id={id}
                            z_index={instruction.z_index}
                            ctx_setter={instruction.ctx_setter}
                            debug={instruction.debug}
                        />
                    );
                } else {
                    return (
                        <SingleShapeRender
                            key={id}
                            action={instruction.action}
                            obj={instruction.obj}
                            shape_id={id}
                            z_index={instruction.z_index}
                            ctx_setter={instruction.ctx_setter}
                            debug={instruction.debug}
                        />
                    );
                }
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

    // Resize canvas to fill screen on component mount and on window resize
    useEffect(() => {
        const resizeCanvas = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                rerender(
                    canvasRef.current.getContext("2d") ?? panic("No context")
                );
            }
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    // Provide canvasRef as a context to children
    return (
        <CanvasContext.Provider value={canvasRef}>
            <canvas ref={canvasRef} className="pointer-events-none absolute" />
            {children}
        </CanvasContext.Provider>
    );
};
