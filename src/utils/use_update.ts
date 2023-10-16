import { useState, useEffect, useRef } from "react";

export function useUpdate<T>(
    f: (callback: (value: T) => (() => void) | void) => void,
    initial: T,
): T {
    const [value, setValue] = useState<T>(() => initial);

    useEffect(() => {
        function callback(newValue: T) {
            setValue(() => newValue);
        }

        return f(callback);
    }, [f]);

    return value;
}

export function useAnimationTime(): number {
    const startTimeRef = useRef(performance.now());
    const time = useUpdate((callback) => {
        const new_request_id = requestAnimationFrame((t) => {
            callback(t - startTimeRef.current);
        });
        return () => {
            cancelAnimationFrame(new_request_id);
        };
    }, 0);
    return time;
}
