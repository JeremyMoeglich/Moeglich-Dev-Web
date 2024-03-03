import { useMemo } from "react";

export function useConstant<T>(constant: T): T {
    // biome-ignore lint/correctness/useExhaustiveDependencies: Not updating is the point
    return useMemo(() => constant, []);
}
