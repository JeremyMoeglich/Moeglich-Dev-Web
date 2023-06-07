import { pairs, panic } from "functional-utilities";
import { type PathCommand, load, type Glyph } from "opentype.js";
import { HollowShape } from "../types/hollow_shape";
import { BezierSolid } from "../types/bezier_solid";
import type { SolidShape } from "../types/interfaces";
import { Point } from "../types/point";
import { PartialBezier } from "../types/partial_bezier";
import { ShapeSet } from "../types/shape_set";
import type { Interpolate } from "~/code/funcs/interpolator";

const font_cache: Map<string, Awaited<ReturnType<typeof load>>> = new Map();

export async function textToShapes(
    text: string,
    fontFilePath = "/fonts/roboto/Roboto-Bold.ttf"
): Promise<ShapeSet<HollowShape<BezierSolid>>> {
    // Load the font file using opentype.js
    const font = await (async () => {
        if (font_cache.has(fontFilePath)) {
            return font_cache.get(fontFilePath) ?? panic();
        } else {
            const font = await load(fontFilePath);
            font_cache.set(fontFilePath, font);
            return font;
        }
    })();

    function convert_coords<T extends SolidShape & Interpolate>(
        shape: HollowShape<T>
    ): HollowShape<T> {
        return shape.flip("y");
    }

    const shapes_from_glyph = (
        glyph: Glyph,
        offset: number
    ): HollowShape<BezierSolid>[] =>
        parseCommands(glyph.path.commands).map((shape) =>
            convert_coords(shape.translate(new Point(offset, 0)))
        );

    // Convert each glyph shape to a Shape object
    const glyphs = [...text].map((char) => font.charToGlyph(char));
    let current_offset = 0;
    if (glyphs.length === 0) {
        return new ShapeSet([]);
    }
    const shapes = shapes_from_glyph(glyphs[0] ?? panic(), current_offset);
    pairs(glyphs).forEach(([prev_glyph, glyph]) => {
        // Get the kerning between the previous glyph and the current glyph
        const kerning = font.getKerningValue(prev_glyph, glyph);
        const prev_width = prev_glyph.advanceWidth ?? 0;
        current_offset += kerning + prev_width;

        // Add the current glyph's shape to the list of shapes
        const new_shapes = shapes_from_glyph(glyph, current_offset);
        shapes.push(...new_shapes);
    });

    return new ShapeSet(shapes);
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
