import { Bundle, createBundle, emptyBundle } from "~/code/bundle";
import { Point, RectSolid, Renderable, Transformable } from "~/code/shapelib";
import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { cheese, cookie, pizza } from "./food_visual";
import { panic } from "functional-utilities";

function box<T extends Renderable & Transformable>(element: T): Bundle<RectSolid | T> {
    const bbox = element.bbox().set_setter((ctx) => {
        ctx.lineWidth = 1;
        ctx.fillStyle = 'gray';
    })
    return createBundle([bbox, element.scale(0.8, bbox.center())]);
}

function align<T extends Renderable & Transformable>(elements: T[], method: 'horizontal' | 'vertical', gap: number): Bundle<T> {
    if (elements.length === 0) {
        return emptyBundle(RectSolid.empty()) as unknown as Bundle<T>
    }
    const centered = elements.map(e => [e.recenter('both'), e.bbox()] as const);
    let x = 0;
    let y = 0;
    const new_elements: T[] = [];
    for (const [element, bbox] of centered) {
        if (method === 'horizontal') {
            new_elements.push(element.translate(new Point(x, 0)));
            x += bbox.width;
        } else {
            new_elements.push(element.translate(new Point(0, y)));
            y += bbox.height;
        }
    }
    return createBundle(new_elements).recenter('both') as unknown as Bundle<T>
}

export function product_visual() {
    return new InterFunc(({ t }: { t: number }) => {
        return align([
            box(cheese),
            box(pizza),
            box(cookie)
        ], 'vertical')
    })
}