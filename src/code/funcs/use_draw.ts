// useDraw takes a ref to a canvas and an array of renderable objects and draws them to the canvas

import { type RefObject, useEffect } from "react";
import type { Renderable } from "../types/interfaces";

export interface DrawParams {
    obj: Renderable | Renderable[],
    action: 'outline' | 'fill' | 'both',
    debug?: boolean,
    ctx_setter?: (ctx: CanvasRenderingContext2D) => void
}

export function useDraw(canvasRef: RefObject<HTMLCanvasElement>, to_render: DrawParams[]) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (const { obj, action, debug, ctx_setter } of to_render) {
                    const objs = Array.isArray(obj) ? obj : [obj];
                    if (ctx_setter) {
                        ctx_setter(ctx);
                    } else {
                        // set default context
                        ctx.lineWidth = 1;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.fillStyle = 'blue';
                        ctx.strokeStyle = 'green';
                    }
                    if (action === 'outline' || action === 'both') {
                        objs.map(obj => obj.render_outline(ctx));
                    }
                    if (action === 'fill' || action === 'both') {
                        objs.map(obj => obj.render_fill(ctx));
                    }
                    if (debug) {
                        objs.map(obj => obj.render_debug(ctx));
                    }
                }
            }
        }
    }, [canvasRef, to_render]);
}