import { sum } from "lodash-es";
import { Shape } from "./interfaces";
import { RectSolid } from "./rect_solid";
import { Point } from "./point";

export class ShapeSet<T extends Shape<T>> implements Shape<ShapeSet<T>> {
    shapes: T[];

    constructor(shapes: T[]) {
        this.shapes = shapes;
    }

    area(): number {
        return sum(this.shapes.map(s => s.area()));
    }

    bbox(): RectSolid {
        return RectSolid.union(this.shapes.map(s => s.bbox()));
    }

    contains(p: Point, quality: number): boolean {
        return this.shapes.some(s => s.contains(p, quality));
    }

    
}