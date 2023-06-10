export type Axis = "x" | "y" | "both";

export type CanvasStyle =
    | typeof CanvasRenderingContext2D.prototype.fillStyle
    | typeof CanvasRenderingContext2D.prototype.strokeStyle;
