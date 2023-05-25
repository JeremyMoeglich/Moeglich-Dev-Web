export function debug_context(
    ctx: CanvasRenderingContext2D,
    fn: (ctx: CanvasRenderingContext2D) => void
): void {
    ctx.save();
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    fn(ctx);
    ctx.restore();
}
