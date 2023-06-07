import { Renderable, RenderableDebug, RenderableOutline } from "./interfaces";

type RenderableTypes = RenderableDebug | RenderableOutline | Renderable;

type PropertyKeys<T> = { [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K }[keyof T];
type PartialContext = Partial<Pick<CanvasRenderingContext2D, PropertyKeys<CanvasRenderingContext2D>>>;

class CtxWrapDebug implements RenderableDebug {
    constructor(
        public obj: RenderableDebug,
        public contextProps: PartialContext
    ) {}

    render_debug(ctx: CanvasRenderingContext2D): void {
        Object.assign(ctx, this.contextProps);
        this.obj.render_debug(ctx);
    }
}

class CtxWrapOutline extends CtxWrapDebug implements RenderableOutline {
    constructor(public obj: RenderableOutline, contextProps: PartialContext) {
        super(obj, contextProps);
    }

    render_outline(ctx: CanvasRenderingContext2D): void {
        Object.assign(ctx, this.contextProps);
        this.obj.render_outline(ctx);
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        Object.assign(ctx, this.contextProps);
        this.obj.select_shape(ctx);
    }
}

class CtxWrapFull extends CtxWrapOutline implements Renderable {
    constructor(public obj: Renderable, contextProps: PartialContext) {
        super(obj, contextProps);
    }

    render_fill(ctx: CanvasRenderingContext2D): void {
        Object.assign(ctx, this.contextProps);
        this.obj.render_fill(ctx);
    }
}

type CtxWrapType<T> = T extends Renderable
    ? CtxWrapFull
    : T extends RenderableOutline
    ? CtxWrapOutline
    : CtxWrapDebug;


export function CtxWrap<T extends RenderableTypes>(obj: T, contextProps: PartialContext): CtxWrapType<T> {
    if ("render_fill" in obj) {
        return new CtxWrapFull(obj, contextProps) as CtxWrapType<T>;
    } else if ("render_outline" in obj) {
        return new CtxWrapOutline(obj, contextProps) as CtxWrapType<T>;
    } else {
        return new CtxWrapDebug(obj, contextProps) as CtxWrapType<T>;
    }
}
