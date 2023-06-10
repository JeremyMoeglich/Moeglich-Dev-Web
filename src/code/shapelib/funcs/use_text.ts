import { useAsyncValue } from "~/utils/use_async_value";
import { BezierSolid } from "../types/bezier_solid";
import { HollowShape } from "../types/hollow_shape";
import { useMemo } from "react";
import { textToShapes } from "./text_to_shape";
import { emptyBundle } from "~/code/bundle";

export function useTextShape(text: string, font_path?: string) {
    const shapes = useAsyncValue(
        useMemo(
            () => async () => await textToShapes(text, font_path),
            [text, font_path]
        ),
        undefined
    );
    return shapes ?? emptyBundle(HollowShape.empty(BezierSolid.empty()));
}
