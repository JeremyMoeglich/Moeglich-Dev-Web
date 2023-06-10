import {
    type ThisMarker,
    type Bundler,
    createBundle,
    rebundle_functionality,
} from "../../../bundle";

export interface Renderable extends RenderableDebug, RenderableOutline {
    render_fill(ctx: CanvasRenderingContext2D): void;
}

export interface RenderableOutline extends RenderableDebug {
    render_outline(ctx: CanvasRenderingContext2D): void;
    select_shape(ctx: CanvasRenderingContext2D): void;
    set_setter(
        ctx_setter: (ctx: CanvasRenderingContext2D) => void
    ): this & ThisMarker;
}

export interface RenderableDebug {
    render_debug(ctx: CanvasRenderingContext2D): void;
}

export function is_Renderable(value: unknown): value is Renderable {
    return (
        (value as Renderable).render_fill !== undefined &&
        is_RenderableOutline(value)
    );
}

export function is_RenderableOutline(
    value: unknown
): value is RenderableOutline {
    return (
        (value as RenderableOutline).render_outline !== undefined &&
        (value as RenderableOutline).select_shape !== undefined &&
        is_RenderableDebug(value)
    );
}

export function is_RenderableDebug(value: unknown): value is RenderableDebug {
    return (value as RenderableDebug).render_debug !== undefined;
}

export const renderable_debug_bundler: Bundler<
    RenderableDebug,
    RenderableDebug
> = {
    isType: is_RenderableDebug,
    functionality: {
        render_debug: (objs, ctx) => {
            for (const obj of objs) {
                obj.render_debug(ctx);
            }
        },
    },
};

export const renderable_outline_bundler: Bundler<
    RenderableOutline,
    RenderableOutline
> = {
    isType: is_RenderableOutline,
    functionality: {
        ...renderable_debug_bundler.functionality,
        render_outline: (objs, ctx) => {
            for (const obj of objs) {
                obj.render_outline(ctx);
            }
        },
        select_shape: (objs, ctx) => {
            for (const obj of objs) {
                obj.select_shape(ctx);
            }
        },
        set_setter: (objs, ctx_setter) => {
            for (const obj of objs) {
                obj.set_setter(ctx_setter);
            }
            return createBundle(objs);
        },
    },
};

export const renderable_bundler: Bundler<Renderable, Renderable> = {
    isType: is_Renderable,
    functionality: {
        ...rebundle_functionality<
            typeof renderable_outline_bundler,
            Renderable
        >(renderable_outline_bundler),
        render_fill: (objs, ctx) => {
            for (const obj of objs) {
                obj.render_fill(ctx);
            }
        },
    },
};
