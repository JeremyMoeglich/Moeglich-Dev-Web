import { useState, useCallback } from "react";

export function useReset<T>(calculate_value: () => T): [T, () => void] {
    const [value, setValue] = useState<T>(calculate_value());

    // biome-ignore lint/correctness/useExhaustiveDependencies: The whole point is to not auto-update
    const reset = useCallback(() => {
        setValue(calculate_value());
    }, []);

    return [value, reset];
}
