import { useState, useEffect } from "react";

export function useUpdate<T>(
    f: (callback: (value: T) => (() => void) | void) => void,
    initial: T
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
    const time = useUpdate((callback) => {
        const new_request_id = requestAnimationFrame((t) => {
            callback(t);
        });
        return () => {
            cancelAnimationFrame(new_request_id);
        };
    }, performance.now());
    return time;
}