import { cached } from "functional-utilities";
import { textToShapes } from "../shapelib/funcs/text_to_shape";

export async function moeglichdev_text() {
    return await cached(() => textToShapes(`moeglich.dev`), "moeglichdev_text");
}

export async function moeglichdev_triangles() {
    return await cached(async () => {
        const text = await moeglichdev_text();
        const triangles = text.triangulate(1);
        return triangles;
    }, "moeglichdev_triangles");
}
