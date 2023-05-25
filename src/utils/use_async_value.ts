import { useState, useEffect } from "react";

type Cache<T> = Map<string, T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache: Cache<any> = new Map();

export function useAsyncValue<T>(
    asyncFunction: () => Promise<T>,
    initialValue: T,
    cache_key?: string
) {
    const [value, setValue] = useState(() => initialValue);

    useEffect(() => {
        async function fetchData() {
            let result: T;
            if (cache_key) {
                const cachedValue = cache.get(cache_key) as T | undefined;
                if (cachedValue !== undefined) {
                    setValue(() => cachedValue);
                    return;
                } else {
                    result = await asyncFunction();
                    cache.set(cache_key, result);
                }
            } else {
                result = await asyncFunction();
            }
            setValue(() => result);
        }

        void fetchData();
    }, [asyncFunction, cache_key]);

    return value;
}
