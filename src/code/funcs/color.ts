import chroma from "chroma-js";
import type { Interpolate } from "./interpolator";

export class Color implements Interpolate {
    color: chroma.Color;

    constructor(r: number, g: number, b: number) {
        this.color = chroma(r, g, b);
    }

    interpolate(t: number, to: Color): Color {
        const newColor = chroma.mix(this.color, to.color, t, "lab");
        return new Color(
            newColor.get("rgb.r"),
            newColor.get("rgb.g"),
            newColor.get("rgb.b")
        );
    }

    getHex(): string {
        return this.color.hex();
    }

    getRGB(): string {
        return this.color.css();
    }

    backgroundColorStyle(): React.CSSProperties {
        return { backgroundColor: this.getRGB() };
    }

    textColorStyle(): React.CSSProperties {
        return { color: this.getRGB() };
    }
}
