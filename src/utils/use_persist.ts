import { useEffect, useMemo, useState } from "react";

export function useConstant<T>(constant: T): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => constant, []);
}

export function useTrueMemo<T>(value: T): T {
    const [lastValue, setLastValue] = useState(value);
    useEffect(() => {
        if (value !== lastValue) {
            setLastValue(value);
        }
    }, [value, lastValue]);
    return lastValue;
}


