import { kdTree } from "kd-tree-javascript";
import type { Point } from "../types/point";

export function create_kdtree(points: Point[]): kdTree<Point> {
    return new kdTree(points, (a, b) => Math.hypot(a.x - b.x, a.y - b.y), [
        "x",
        "y",
    ]);
}
