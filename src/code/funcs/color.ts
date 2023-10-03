import chroma from "chroma-js";
import type { Interpolate } from "./interpolator";
import { v4 } from "uuid";
import { type ThisReturn } from "../bundle";

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
        this.color = chroma(r, g, b, "rgb");
    }

    rgb(): [number, number, number] {
        return this.color.rgb();
    }

    clone() {
        return new Color(
            this.color.get("rgb.r"),
            this.color.get("rgb.g"),
            this.color.get("rgb.b")
        );
    }

    shift_hue(amount: number) {
        const n = this.clone();
        n.color = n.color.set("hsl.h", amount % 360);
        return n;
    }

    interpolate(t: number, to: this) {
        const newColor = chroma.mix(this.color, to.color, t, "lab");
        return new Color(
            newColor.get("rgb.r"),
            newColor.get("rgb.g"),
            newColor.get("rgb.b")
        ) as this & ThisReturn;
    }

    can_interpolate(value: unknown): value is this {
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

    static fromHex(hex: string) {
        const color = chroma(hex);
        return new Color(
            color.get("rgb.r"),
            color.get("rgb.g"),
            color.get("rgb.b")
        );
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

    to_start() {
        return this as this & ThisReturn;
    }
}
