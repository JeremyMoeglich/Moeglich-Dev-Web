import { useAsyncValue } from "~/utils/use_async_value";
import { BezierSolid } from "../types/bezier_solid";
import { HollowShape } from "../types/hollow_shape";
import { useMemo } from "react";
import { type TextToShapeConfig, textToShapes } from "./text_to_shape";
import { emptyBundle } from "~/code/bundle";

export function useTextShape(text: string, config?: TextToShapeConfig) {
    const shapes = useAsyncValue(
        useMemo(
            () => async () => await textToShapes(text, config),
            [text, config]
        ),
        undefined
    );
    return shapes ?? emptyBundle(HollowShape.empty(BezierSolid.empty()));
}
