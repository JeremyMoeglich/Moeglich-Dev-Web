import { type Bundle, createBundle, emptyBundle } from "~/code/bundle";
import { RectSolid } from "../types/rect_solid";
import { type Renderable } from "../types/interfaces/renderable";
import { type Transformable } from "../types/interfaces/transformable";
import { Point } from "../types/point";
import { zip } from "functional-utilities";
import { type BezierSolid } from "../types/bezier_solid";
import { type Color } from "~/code/funcs/color";
import { dedent } from "~/utils/dedent";

export function box<T extends Renderable & Transformable>(
    element: T,
    options: {
        rounded?: number;
        min_width?: number;
        min_height?: number;
        color: Color;
    },
): Bundle<BezierSolid | RectSolid | T> {
    let bbox: RectSolid | BezierSolid = element.bbox();
    const center = bbox.center();
    if (options.min_width) {
        bbox = new RectSolid(
            bbox.x,
            bbox.y,
            Math.max(options?.min_width ?? bbox.width, bbox.width),
            Math.max(options?.min_height ?? bbox.height, bbox.height),
        )
            .recenter("both")
            .translate(center);
    }

    let shape = options.rounded ? bbox.round_corners(options.rounded) : bbox;
    shape = shape.set_setter((ctx) => {
        ctx.lineWidth = 1;
        ctx.fillStyle = options.color.getHex();
    });
    return createBundle([shape, element.scale(0.8, bbox.center())] as [
        BezierSolid | RectSolid,
        T,
    ]);
}

type AlignOptions = {
    direction: "horizontal" | "vertical";
} & (
    | {
          gap: number;
          size: number;
          method: "resize";
          // Resize elements such that they fit in the given size and gap.
      }
    | {
          size: number;
          method: "evenly";
          // Distribute elements in equally spaced intervals of the given size. Even if the elements vary in size, might result in overlap
      }
    | {
          gap: number;
          method: "equal_gap";
          // Don't restrict total space, but make sure the gap between elements is equal.
      }
);

export function align<T extends Renderable & Transformable>(
    elements: T[],
    options: AlignOptions = {
        direction: "horizontal",
        method: "equal_gap",
        gap: 0,
    },
): Bundle<T> {
    if (elements.length === 0) {
        return emptyBundle(RectSolid.empty()) as unknown as Bundle<T>;
    }

    const new_elements: T[] = [];
    let position = 0;

    const totalElementSize =
        options.direction === "horizontal"
            ? elements.reduce(
                  (total, element) => total + element.bbox().width,
                  0,
              )
            : elements.reduce(
                  (total, element) => total + element.bbox().height,
                  0,
              );

    const scaleFactor =
        options.method === "resize"
            ? (options.size - options.gap * (elements.length - 1)) /
              totalElementSize
            : 1;

    for (const element of elements) {
        const transformed_element = element.recenter("both").scale(scaleFactor);

        const translation =
            options.direction === "horizontal"
                ? new Point(position - transformed_element.bbox().center().x, 0)
                : new Point(
                      0,
                      position - transformed_element.bbox().center().y,
                  );

        new_elements.push(
            transformed_element.translate(translation) as unknown as T,
        );

        switch (options.method) {
            case "resize":
            case "equal_gap":
                position +=
                    scaleFactor *
                        (options.direction === "horizontal"
                            ? element.bbox().width
                            : element.bbox().height) +
                    options.gap;
                break;
            case "evenly":
                position += options.size / elements.length;
                break;
        }
    }

    return createBundle(new_elements).recenter(
        options.direction === "horizontal" ? "x" : "y",
    ) as unknown as Bundle<T>;
}

export function table<T extends Renderable & Transformable>(
    elements: T[][],
    x_widths: number[],
    y_widths: number[],
): Bundle<Bundle<T>> {
    const first_row = elements[0];
    if (!first_row || x_widths.length === 0 || y_widths.length === 0) {
        return emptyBundle(RectSolid.empty()) as unknown as Bundle<Bundle<T>>;
    }

    // Make sure that the widths and heights arrays have the right lengths.
    if (
        elements.length !== y_widths.length ||
        first_row.length !== x_widths.length
    ) {
        throw new Error(dedent`
            The lengths of the widths and heights arrays must match the number of rows and columns in the table.
            ${
                elements.length !== y_widths.length
                    ? `Expected ${elements.length} but got ${y_widths.length} Rows`
                    : ""
            }
            ${
                first_row.length !== x_widths.length
                    ? `Expected ${first_row.length} but got ${x_widths.length} Columns`
                    : ""
            }
        `);
    }

    const rows: Bundle<T>[] = [];

    let y_position = 0;
    for (const [elementRow, y_width] of zip([elements, y_widths])) {
        const row: T[] = [];
        let x_position = 0;

        for (const [element, x_width] of zip([elementRow, x_widths])) {
            const translation = new Point(
                x_position - element.bbox().center().x,
                y_position - element.bbox().center().y,
            );
            row.push(element.translate(translation) as unknown as T);

            x_position += x_width;
        }

        rows.push(createBundle(row) as unknown as Bundle<T>);

        y_position += y_width;
    }

    return createBundle(rows).recenter("both") as unknown as Bundle<Bundle<T>>;
}
