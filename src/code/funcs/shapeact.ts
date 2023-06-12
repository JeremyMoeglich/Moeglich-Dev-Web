export function shapeaction(ctx: CanvasRenderingContext2D, action: 'stroke' | 'fill') {
    if (action === 'stroke') {
        ctx.stroke();
    }
    if (action === 'fill') {
        (ctx as unknown as { mozFillRule: string }).mozFillRule = "evenodd"; // For old Firefox versions, doesn't really matter as it's likely broken anyway
        ctx.fill("evenodd");
    }
}