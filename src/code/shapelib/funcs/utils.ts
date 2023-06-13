import { Bundle, createBundle, emptyBundle } from "~/code/bundle";
import { RectSolid } from "../types/rect_solid";
import { Renderable } from "../types/interfaces/renderable";
import { Transformable } from "../types/interfaces/transformable";
import { Point } from "../types/point";
import { cyclic_pairs } from "functional-utilities";

export function box<T extends Renderable & Transformable>(
    element: T
): Bundle<RectSolid | T> {
    const bbox = element.bbox().set_setter((ctx) => {
        ctx.lineWidth = 1;
        ctx.fillStyle = "gray";
    });
    return createBundle([bbox, element.scale(0.8, bbox.center())]);
}

type AlignOptions = {
    direction: "horizontal" | "vertical";
} & (
    | {
        gap: number;
        size: number;
        method: "resize"
        // Resize elements such that they fit in the given size and gap.
    } | {
        size: number;
        method: "evenly"
        // Distribute elements in equally spaced intervals of the given size. Even if the elements vary in size, might result in overlap
    } | {
        gap: number;
        method: "equal_gap"
        // Don't restrict total space, but make sure the gap between elements is equal.
    }
);


export function align<T extends Renderable & Transformable>(
    elements: T[],
    options: AlignOptions
): Bundle<T> {
    if (elements.length === 0) {
        return emptyBundle(RectSolid.empty()) as unknown as Bundle<T>;
    }

    const new_elements: T[] = [];
    let position = new Point(0, 0);
    let scaleFactor = 1;

    if(options.method === "resize") {
        const totalGap = options.gap * (elements.length - 1);
        const totalElementSize = options.direction === "horizontal"
            ? elements.reduce((total, element) => total + element.bbox().width, 0)
            : elements.reduce((total, element) => total + element.bbox().height, 0);

        scaleFactor = (options.size - totalGap) / totalElementSize;
    }

    for (const [element, nextElement] of cyclic_pairs(elements)) {
        let elementCentered = element.recenter("both");
        let nextElementCentered = nextElement.recenter("both");

        if(options.method === "resize") {
            elementCentered = elementCentered.scale(scaleFactor);
            nextElementCentered = nextElementCentered.scale(scaleFactor);
        }

        const bbox = elementCentered.bbox();
        const nextBbox = nextElementCentered.bbox();

        let translation;
        switch (options.method) {
            case "resize":
            case "equal_gap":
                translation = options.direction === "horizontal" 
                    ? new Point(position.x - bbox.center().x, 0) 
                    : new Point(0, position.y - bbox.center().y);
                break;
            case "evenly":
                translation = options.direction === "horizontal" 
                    ? new Point(options.size/elements.length - bbox.width/2, 0) 
                    : new Point(0, options.size/elements.length - bbox.height/2);
                break;
        }
        
        new_elements.push(elementCentered.translate(translation));

        switch (options.method) {
            case "resize":
            case "equal_gap":
                position = options.direction === "horizontal" 
                    ? new Point(position.x + bbox.width/2 + nextBbox.width/2 + options.gap, 0)
                    : new Point(0, position.y + bbox.height/2 + nextBbox.height/2 + options.gap);
                break;
            case "evenly":
                position = options.direction === "horizontal" 
                    ? new Point(position.x + options.size/elements.length, 0)
                    : new Point(0, position.y + options.size/elements.length);
                break;
        }
    }

    return createBundle(new_elements).recenter("both") as unknown as Bundle<T>;
}



type TableOptions = {
    orientation: "rows" | "columns";
    gap: number,
    x_size: number,
    y_size: number
}

export function table<T extends Renderable & Transformable>(
    elements: T[][],
    options: TableOptions
): Bundle<T> {
    return align(
        elements.map((row) =>
            align(
                row,
                {
                    direction: options.orientation === "rows" ? "horizontal" : "vertical",
                    gap: options.gap,
                    size: options.orientation === "rows" ? options.x_size : options.y_size,
                    method: "resize"
                }
            )
        ),
        {
            direction: options.orientation === "rows" ? "vertical" : "horizontal",
            gap: options.gap,
            size: options.orientation === "rows" ? options.y_size : options.x_size,
            method: "resize"
        }
    ) as unknown as Bundle<T>;
}
