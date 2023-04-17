import { useAsyncValue } from "~/utils/use_async_value";
import type { BezierSolid } from "../types/bezier_solid";
import type { HollowShape } from "../types/hollow_shape";
import { useMemo } from "react";
import { textToShapes } from "./text_to_shape";

export function useTextShape(text: string, font_path?: string): HollowShape<BezierSolid>[] {
    const shapes = useAsyncValue(
        useMemo(() => (async () => await textToShapes(text, font_path)), [text, font_path]),
        undefined,
    );
    return shapes ?? []
}