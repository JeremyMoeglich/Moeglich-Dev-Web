import { cover, pairs, panic } from "functional-utilities";
import { type PathCommand, load, type Glyph } from "opentype.js";
import { HollowShape } from "../types/hollow_shape";
import { BezierSolid } from "../types/bezier_solid";
import { Point } from "../types/point";
import { PartialBezier } from "../types/partial_bezier";
import type { Interpolate } from "~/code/funcs/interpolator";
import { type Bundle, emptyBundle, createBundle } from "~/code/bundle";
import { type SolidShape } from "../types/interfaces/solidshape";
import { languages } from "~/code/funcs/lex";

const font_cache: Map<string, Awaited<ReturnType<typeof load>>> = new Map();

async function load_font(fontFilePath: string) {
    if (font_cache.has(fontFilePath)) {
        return font_cache.get(fontFilePath) ?? panic();
    } else {
        const font = await load(fontFilePath);
        font_cache.set(fontFilePath, font);
        return font;
    }
}

export type TextToShapeConfig = {
    fontFilePath?: string;
    lineSpacing?: number;
    highlight?: keyof typeof languages | null;
};

type Required<T> = {
    [P in keyof T]-?: T[P];
};

const defaultConfig: Required<TextToShapeConfig> = {
    fontFilePath: "/fonts/roboto/Roboto-Bold.ttf",
    lineSpacing: 1.2,
    highlight: null,
};

function get_config(config?: TextToShapeConfig): Required<TextToShapeConfig> {
    return cover(defaultConfig, config ?? {});
}

export async function textToShapes(
    text: string,
    config?: TextToShapeConfig
): Promise<Bundle<HollowShape<BezierSolid>>> {
    const rconfig = get_config(config);
    await load_font(rconfig.fontFilePath);
    return syncTextToShapes(text, rconfig) ?? panic("syncTextToShapes failed");
}

const glyphCache: Map<number, HollowShape<BezierSolid>[]> = new Map();

function shapes_from_glyph(
    glyph: Glyph,
    offset: Point
): HollowShape<BezierSolid>[] {
    const cached = !glyph.unicode ? undefined : glyphCache.get(glyph.unicode);
    const parsedCommands =
        cached ??
        (() => {
            const parsed = parseCommands(glyph.path.commands);
            glyph.unicode && glyphCache.set(glyph.unicode, parsed);
            return parsed;
        })();

    return parsedCommands.map((shape) =>
        convert_coords(shape.translate(offset))
    );
}

function convert_coords<T extends SolidShape & Interpolate>(
    shape: HollowShape<T>
): HollowShape<T> {
    return shape.flip("y");
}

export function syncTextToShapes(
    text: string,
    config?: TextToShapeConfig
): Bundle<HollowShape<BezierSolid>> | undefined {
    const rconfig = get_config(config);
    const font = font_cache.get(rconfig.fontFilePath);
    if (!font) {
        void load_font(rconfig.fontFilePath);
        return undefined;
    }

    const lines = text.split("\n");
    let line_offset = 0;
    let source = 0; // Initialize a global source counter.
    const line_glyphs = lines.map((line) => {
        const glyphs = [...line].map((char) => {
            const glyph = font.charToGlyph(char);
            const currentSource = source; // Capture the current source value.
            source++; // Increment source after each character.
            return { glyph, source: currentSource };
        });
        source++; // Increment source after each line to account for '\n'.
        return glyphs;
    });

    if (line_glyphs.length === 0) {
        return emptyBundle(new HollowShape(new BezierSolid([]), []));
    }
    const shapes: { shape: HollowShape<BezierSolid>; source: number }[] = [];
    line_glyphs.forEach((glyphs) => {
        let current_offset = 0;
        const first_glyph = glyphs[0]?.glyph;
        if (!first_glyph) {
            return;
        }
        shapes.push(
            ...shapes_from_glyph(
                first_glyph,
                new Point(current_offset, line_offset)
            ).map((shape) => ({ shape, source: glyphs[0]?.source ?? 0 }))
        );
        pairs(glyphs).forEach(([{ glyph: prev_glyph }, { glyph, source }]) => {
            const kerning = font.getKerningValue(prev_glyph, glyph);
            const prev_width = prev_glyph.advanceWidth ?? 0;
            current_offset += kerning + prev_width;
            const new_shapes = shapes_from_glyph(
                glyph,
                new Point(current_offset, line_offset)
            ).map((shape) => ({ shape, source }));
            shapes.push(...new_shapes);
        });
        // Adjust line_offset based on lineSpacing and font size
        line_offset -= font.unitsPerEm * rconfig.lineSpacing;
    });

    if (!rconfig.highlight) {
        return createBundle(shapes.map(({ shape }) => shape));
    }

    const highlight = languages[rconfig.highlight](text);
    const highlighted = shapes.map(({ shape, source }) => {
        const token = highlight.find(
            (token) =>
                source >= token.start_offset &&
                source < token.start_offset + token.content.length
        );
        if (token) {
            return shape.set_setter((ctx) => {
                ctx.fillStyle = token.color.getHex();
            });
        } else {
            return shape;
        }
    });
    return createBundle(highlighted);
}

function parseCommands(commands: PathCommand[]): HollowShape<BezierSolid>[] {
    const beziers = pathCommandsToBeziers(commands);
    return beziersToShapes(beziers);
}

function pathCommandsToBeziers(pathCommands: PathCommand[]): BezierSolid[] {
    const beziers: BezierSolid[] = [];
    let currentPath: BezierSolid = new BezierSolid([]);

    for (const command of pathCommands) {
        if (command.type === "M") {
            // Start a new path
            if (currentPath.segment_amount() > 0) {
                beziers.push(currentPath);
            }
            currentPath = new BezierSolid([]);
        } else if (command.type === "C") {
            // Add a cubic bezier curve
            const curve: PartialBezier = new PartialBezier(
                new Point(command.x1, command.y1),
                new Point(command.x2, command.y2),
                new Point(command.x, command.y)
            );
            currentPath.push_segment(curve);
        } else if (command.type === "L") {
            // Add a straight line segment
            const line: PartialBezier = new PartialBezier(
                new Point(command.x, command.y),
                new Point(command.x, command.y),
                new Point(command.x, command.y)
            );
            currentPath.push_segment(line);
        } else if (command.type === "Q") {
            // Add a quadratic bezier curve
            const curve: PartialBezier = new PartialBezier(
                new Point(command.x1, command.y1),
                new Point(command.x, command.y),
                new Point(command.x, command.y)
            );
            currentPath.push_segment(curve);
        }
    }

    // Push the last path
    if (currentPath.segment_amount() > 0) {
        beziers.push(currentPath);
    }

    return beziers;
}

function beziersToShapes(beziers: BezierSolid[]): HollowShape<BezierSolid>[] {
    if (beziers.length === 0) {
        return [];
    }
    const shapes: HollowShape<BezierSolid>[] = [
        new HollowShape(beziers[0] ?? panic(), []),
    ];
    for (const solid of beziers.slice(1)) {
        let found = false;
        for (const shape of [...shapes]) {
            const relation = shape.exterior.relation_to(solid);
            if (relation === "this_inside_other") {
                // The shape is inside the path, meaning the path is the exterior of the shape and the current exterior is a hole
                shape.push_hole(shape.exterior);
                shape.replace_exterior(solid);
                found = true;
                continue;
            } else if (relation === "other_inside_this") {
                // The path is inside the shape, meaning the path is a hole
                shape.push_hole(solid);
                found = true;
            } else if (relation === "outline_intersect") {
                // The current model of exterior and holes does not define intersecting outlines
                console.warn("Outline intersection detected");
            }
        }
        if (!found) {
            // The path is not inside any other shape, so it is a new shape
            shapes.push(new HollowShape(solid, []));
        }
    }

    return shapes;
}
