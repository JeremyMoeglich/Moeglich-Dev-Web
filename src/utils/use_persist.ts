import { useMemo } from "react";

export function useConstant<T>(constant: T): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => constant, []);
}
