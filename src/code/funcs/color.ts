import chroma from "chroma-js";
import type { Interpolate } from "./interpolator";
import { v4 } from "uuid";

export class Color implements Interpolate {
    color: chroma.Color;

    private cache: {
        id?: string;
    } = {};

    id(): string {
        if (this.cache.id) return this.cache.id;
        const id = v4();
        this.cache.id = id;
        return id;
    }

    constructor(r: number, g: number, b: number) {
        this.color = chroma(r, g, b);
    }

    interpolate(t: number, to: Color): this {
        const newColor = chroma.mix(this.color, to.color, t, "lab");
        return new Color(
            newColor.get("rgb.r"),
            newColor.get("rgb.g"),
            newColor.get("rgb.b")
        ) as this;
    }

    is_this(value: unknown): value is this {
        return value instanceof Color;
    }

    similarity(to: this): number {
        const rgb1 = this.color.rgb();
        const rgb2 = to.color.rgb();
    
        const dr = rgb1[0] - rgb2[0];
        const dg = rgb1[1] - rgb2[1];
        const db = rgb1[2] - rgb2[2];
    
        // Euclidean distance
        return Math.sqrt(dr * dr + dg * dg + db * db);
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

    to_start(): this {
        return this;
    }
}
