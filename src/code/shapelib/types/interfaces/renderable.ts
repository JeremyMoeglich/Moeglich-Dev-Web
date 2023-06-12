import {
    type ThisReturn,
    type Bundler,
    createBundle,
} from "../../../bundle";

export interface Renderable {
    select_shape(ctx: CanvasRenderingContext2D): void;
    render(ctx: CanvasRenderingContext2D, action: 'stroke' | 'fill'): void;
    render_debug(ctx: CanvasRenderingContext2D): void;
    set_setter(
        ctx_setter: (ctx: CanvasRenderingContext2D) => void
    ): this & ThisReturn;
}


export function is_Renderable(value: unknown): value is Renderable {
    return (
        (value as Renderable).select_shape !== undefined &&
        (value as Renderable).render !== undefined &&
        (value as Renderable).set_setter !== undefined
    );
}


export const renderable_bundler: Bundler<Renderable, Renderable> = {
    isType: is_Renderable,
    functionality: {
        render: (objs, ctx, action) => {
            for (const obj of objs) {
                obj.render(ctx, action);
            }
        },
        render_debug: (objs, ctx) => {
            for (const obj of objs) {
                obj.render_debug(ctx);
            }
        },
        select_shape: (objs, ctx) => {
            for (const obj of objs) {
                obj.select_shape(ctx);
            }
        },
        set_setter: (objs, ctx_setter) => {
            return createBundle(objs.map((obj) => obj.set_setter(ctx_setter)));
        }
    },
};
