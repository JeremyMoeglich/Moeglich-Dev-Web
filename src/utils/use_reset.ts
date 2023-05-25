import { useState, useCallback } from "react";

export function useReset<T>(calculate_value: () => T): [T, () => void] {
    const [value, setValue] = useState<T>(calculate_value());

    const reset = useCallback(() => {
        setValue(calculate_value());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [value, reset];
}
