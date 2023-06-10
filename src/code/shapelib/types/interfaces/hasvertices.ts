import type { Bundler } from "~/code/bundle";
import type { Point } from "../point";
import type { LineSegment } from "../line_segment";

export interface HasVertices {
    vertices(): Point[];
    lines(): LineSegment[];
}

export function is_HasVertices(value: unknown): value is HasVertices {
    return (
        (value as HasVertices).vertices !== undefined &&
        (value as HasVertices).lines !== undefined
    );
}

export const has_vertices_bundler: Bundler<HasVertices, HasVertices> = {
    isType: is_HasVertices,
    functionality: {
        vertices: (objects) => {
            return objects.flatMap((o) => o.vertices());
        },
        lines: (objects) => {
            return objects.flatMap((o) => o.lines());
        },
    },
};
