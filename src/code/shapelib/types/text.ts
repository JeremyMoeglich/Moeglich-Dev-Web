import { type Interpolate } from "~/code/funcs/interpolator";
import { type Renderable } from "./interfaces/renderable";
import { type Transformable } from "./interfaces/transformable";

import { panic } from "functional-utilities";
import { LRUCache } from "lru-cache";
import { RectSolid } from "./rect_solid";
import { Point } from "./point";
import {
    type Bundle,
    createBundle,
    emptyBundle,
    type ThisReturn,
    type UnMarkThis,
} from "~/code/bundle";
import { type Axis } from "./types";
import { split_include } from "~/utils/split_include";
import { languages } from "~/code/funcs/lex";
import { max } from "lodash-es";

const IS_BROWSER = typeof window !== "undefined";

let context: CanvasRenderingContext2D | null = null;
if (IS_BROWSER) {
    const canvas = document.createElement("canvas");
    context = canvas.getContext("2d") ?? panic("no context");
}

const textSizeCache = new LRUCache<string, { width: number; height: number }>({
    max: 1000,
});

type UnitConverter = (value: number, meta: MetaData) => number;
type MetaData = {
    rootFontSize: number;
    viewportWidth: number;
    viewportHeight: number;
};

const units = {
    px: (value) => value,
    rem: (value, meta) => value * meta.rootFontSize,
    vw: (value, meta) => (value * meta.viewportWidth) / 100,
    vh: (value, meta) => (value * meta.viewportHeight) / 100,
} satisfies Record<string, UnitConverter>;

const getUnitConverter = (unit: keyof typeof units): UnitConverter => {
    return units[unit] ?? units["px"];
};

export const measureTextSize = (
    text: string,
    fontSize: number,
    line_height_factor = 1.2,
    unit: keyof typeof units = "px",
    fontName = `"Fira Code", monospace`,
) => {
    if (text.length === 0) return { width: 0, height: 0 };
    if (!IS_BROWSER) return { width: 0, height: 0 };

    const cacheKey = `${text}_${fontName}_${unit}`;
    const size =
        textSizeCache.get(cacheKey) ??
        (() => {
            if (!context) return { width: 0, height: 0 };
            context.font = `1${unit} ${fontName}`;
            const width =
                max(
                    text
                        .split("\n")
                        .map(
                            (line) =>
                                (context ?? panic()).measureText(line).width,
                        ),
                ) ?? 0;

            const metaData: MetaData = {
                rootFontSize: parseFloat(
                    getComputedStyle(document.documentElement).fontSize,
                ),
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
            };
            const unitConverter = getUnitConverter(unit);
            const height = unitConverter(
                line_height_factor * text.split("\n").length,
                metaData,
            );

            const size = { width, height };
            textSizeCache.set(cacheKey, size);
            return size;
        })();

    return {
        width: size.width * fontSize,
        height: size.height * fontSize,
    };
};

export class Text implements Interpolate, Renderable, Transformable {
    text: string;
    size: number;
    line_height_factor: number;
    font: string;
    position: Point;
    scalex = 1;
    scaley = 1;
    rotation = 0;

    constructor(
        text: string,
        position: Point,
        size: number,
        line_height = 1.2,
        font = `"Fira Code", monospace`,
        public ctx_setter?: (ctx: CanvasRenderingContext2D) => void,
    ) {
        this.text = text;
        this.size = size;
        this.font = font;
        this.position = position;
        this.line_height_factor = line_height;
    }

    static empty() {
        return new Text("", new Point(0, 0), 0);
    }

    bbox(): RectSolid {
        const { width, height } = measureTextSize(
            this.text,
            this.size,
            this.line_height_factor,
            "px",
            this.font,
        );
        return new RectSolid(
            this.position.x,
            this.position.y,
            width * this.scalex,
            height * this.scaley,
        ).rotate(this.rotation);
    }

    flip(axis: Axis): this & ThisReturn {
        const center = this.bbox().center();
        const scale = new Point(axis !== "y" ? -1 : 1, axis !== "x" ? -1 : 1);
        const offset = new Point(
            axis !== "y" ? (center.x - this.position.x) * 2 : 0,
            axis !== "x" ? (center.y - this.position.y) * 2 : 0,
        );
        return this.scale(scale).translate(offset);
    }

    scale(scale: Point | number, origin?: Point): this & ThisReturn {
        const o = origin ?? this.bbox().center();
        const text = new Text(
            this.text,
            this.position.scale(scale, o),
            this.size,
            this.line_height_factor,
            this.font,
            this.ctx_setter,
        );
        text.scalex =
            this.scalex * (typeof scale === "number" ? scale : scale.x);
        text.scaley =
            this.scaley * (typeof scale === "number" ? scale : scale.y);
        text.rotation = this.rotation;
        return text as this & ThisReturn;
    }

    rotate(angle: number, origin?: Point | undefined): this & ThisReturn {
        const o = origin ?? this.bbox().center();
        const text = new Text(
            this.text,
            this.position.rotate(angle, o),
            this.size,
            this.line_height_factor,
            this.font,
            this.ctx_setter,
        );
        text.scalex = this.scalex;
        text.scaley = this.scaley;
        text.rotation = this.rotation + angle;
        return text as this & ThisReturn;
    }

    translate(offset: Point): this & ThisReturn {
        const text = new Text(
            this.text,
            this.position.translate(offset),
            this.size,
            this.line_height_factor,
            this.font,
            this.ctx_setter,
        );
        text.scalex = this.scalex;
        text.scaley = this.scaley;
        text.rotation = this.rotation;
        return text as this & ThisReturn;
    }

    can_interpolate(value: unknown): boolean {
        return value instanceof Text && this.text === value.text;
    }

    interpolate(t: number, to: UnMarkThis<this>): this & ThisReturn {
        const text = new Text(
            this.text,
            this.position.interpolate(t, to.position),
            this.size + (to.size - this.size) * t,
            this.line_height_factor,
            to.font,
        );
        text.scalex = this.scalex + (to.scalex - this.scalex) * t;
        text.scaley = this.scaley + (to.scaley - this.scaley) * t;
        text.rotation = this.rotation + (to.rotation - this.rotation) * t;
        text.ctx_setter = to.ctx_setter;
        return text as this & ThisReturn;
    }

    similarity(to: UnMarkThis<this>): number {
        const size_sim =
            this.position.similarity(to.position) +
            Math.abs(this.size - to.size) +
            Math.abs(this.rotation - to.rotation);
        return size_sim;
    }

    to_start(): this & ThisReturn {
        return this.scale(0);
    }

    set_setter(
        ctx_setter: (ctx: CanvasRenderingContext2D) => void,
    ): this & ThisReturn {
        this.ctx_setter = ctx_setter;
        return this as this & ThisReturn;
    }

    select_shape(ctx: CanvasRenderingContext2D): void {
        ctx.translate(this.position.x, this.position.y);
        ctx.scale(this.scalex, this.scaley);
        ctx.rotate(this.rotation);
        ctx.textBaseline = "top";
        ctx.font = `${this.size}px ${this.font}`;
    }

    get_line_height(): number {
        const height = this.bbox().height;
        const lines = this.text.split("\n");
        if (lines.length === 0) return height;
        return (height / lines.length) * this.line_height_factor;
    }

    render(ctx: CanvasRenderingContext2D, action: "stroke" | "fill"): void {
        ctx.save();
        this.select_shape(ctx);
        this.ctx_setter && this.ctx_setter(ctx);

        // split the text into lines
        const lines = this.text.split("\n");
        const line_height = this.get_line_height();

        lines.map((line, index) => {
            const y = index * line_height;

            if (action === "fill") {
                ctx.fillText(line, 0, y);
            } else if (action === "stroke") {
                ctx.strokeText(line, 0, y);
            }
        });

        ctx.restore();
    }

    render_debug(ctx: CanvasRenderingContext2D): void {
        this.bbox().render_debug(ctx);
    }

    split(sep = ""): Bundle<Text> {
        if (this.text === "") return emptyBundle(Text.empty());
        let x = 0;
        let y = 0;
        const line_height = this.get_line_height();
        const texts = split_include(this.text, sep).flatMap((text) => {
            if (text === " ") {
                return [];
            } else {
                let remaining = text;
                const chunks: Text[] = [];
                while (remaining.includes("\n")) {
                    const index = remaining.indexOf("\n");
                    chunks.push(
                        new Text(
                            remaining.slice(0, index),
                            new Point(x, y),
                            this.size,
                            this.line_height_factor,
                            this.font,
                        ),
                    );
                    x = 0;
                    y += line_height;
                    remaining = remaining.slice(index + 1);
                }
                return chunks;
            }
        });
        return createBundle(texts)
            .scale(new Point(this.scalex, this.scaley))
            .rotate(this.rotation)
            .translate(this.position);
    }

    highlight(language: keyof typeof languages): Bundle<Text> {
        const result = languages[language](this.text).sort(
            (a, b) => a.start_offset - b.start_offset,
        );
        let x = 0;
        let last_line = -1;
        const line_height = this.get_line_height();
        const texts = result.map((token) => {
            const real_line = token.line - 1; // the tokenizer starts at line 1
            if (real_line !== last_line) {
                x = measureTextSize(
                    " ".repeat(token.column - 1),
                    this.size,
                    this.line_height_factor,
                    "px",
                    this.font,
                ).width;
                last_line = real_line;
            }
            const text = new Text(
                token.content,
                new Point(x, real_line * line_height),
                this.size,
                this.line_height_factor,
                this.font,
            );
            x += text.bbox().width;
            return text.set_setter((ctx) => {
                ctx.fillStyle = token.color.getHex();
            });
        });
        return createBundle(texts)
            .scale(new Point(this.scalex, this.scaley))
            .rotate(this.rotation)
            .translate(this.position);
    }

    center(): Point {
        return this.bbox().center();
    }

    recenter(axis: Axis): this & ThisReturn {
        const center = this.center();
        const offset = new Point(
            axis !== "y" ? -center.x : 0,
            axis !== "x" ? -center.y : 0,
        );
        return this.translate(offset);
    }
}
