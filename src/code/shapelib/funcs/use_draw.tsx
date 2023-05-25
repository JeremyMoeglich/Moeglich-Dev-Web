// useDraw takes a ref to a canvas and an array of renderable objects and draws them to the canvas

import { type RefObject, useEffect, useRef } from "react";
import type { Renderable } from "../types/interfaces";

export interface DrawParams {
    obj: Renderable;
    action: "outline" | "fill" | "both";
    debug?: boolean;
    ctx_setter?: (ctx: CanvasRenderingContext2D) => void;
}

export function useDraw(
    canvasRef: RefObject<HTMLCanvasElement>,
    to_render: DrawParams[]
) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (const { obj, action, debug, ctx_setter } of to_render) {
                    ctx.lineWidth = 1;
                    ctx.lineCap = "round";
                    ctx.lineJoin = "round";
                    ctx.fillStyle = "blue";
                    ctx.strokeStyle = "green";
                    ctx.globalAlpha = 1;

                    if (ctx_setter) {
                        ctx_setter(ctx);
                    }
                    if (action === "outline" || action === "both") {
                        obj.render_outline(ctx);
                    }
                    if (action === "fill" || action === "both") {
                        obj.render_fill(ctx);
                    }
                    if (debug) {
                        obj.render_debug(ctx);
                    }
                }
            }
        }
    }, [canvasRef, to_render]);
}

export function ShapeRender({
    instructions,
    width,
    height,
}: {
    instructions: DrawParams[];
    width: number;
    height: number;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useDraw(canvasRef, instructions);
    return <canvas ref={canvasRef} width={width} height={height} />;
}
