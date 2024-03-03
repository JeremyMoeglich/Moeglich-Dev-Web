export type Data<T> = T | Data<T>[] | { [k: string]: Data<T> };

export function map_data<T, O>(data: Data<T>, func: (v: T) => O): Data<O> {
    if (Array.isArray(data)) {
        return data.map((v) => map_data(v, func));
    }
    if (typeof data === "object") {
        const obj: { [k: string]: Data<O> } = {};
        for (const k in data) {
            const d = (data as Record<string, Data<T>>)[k] as Data<T>;
            obj[k] = map_data<T, O>(d, func);
        }
        return obj;
    }
    return func(data);
}

type UnwrapData<T> = T extends Data<infer R>
    ? R extends any[]
        ? UnwrapDataArray<R>
        : R extends object
          ? UnwrapDataObject<R>
          : R
    : never;

type UnwrapDataArray<T extends any[]> = T extends (infer U)[]
    ? UnwrapData<U>[]
    : never;

type UnwrapDataObject<T extends object> = T extends infer O
    ? { [K in keyof O]: UnwrapData<O[K]> }
    : never;

export function compare_data<D extends Data<any>[], O>(
    datas: [...D],
    comp: (values: { [K in keyof D]: UnwrapData<D[K]> }) => O,
): Data<O> | undefined {
    if (datas.length === 0) {
        return undefined;
    }

    const first = datas[0];

    // Base case: When data contains only atomic values
    if (datas.every((data) => typeof data !== "object")) {
        return comp(datas as { [K in keyof D]: UnwrapData<D[K]> });
    }

    // Check for array structures
    if (datas.every((data) => Array.isArray(data))) {
        const firstArray = first as Data<unknown>[];
        if (
            !datas.every(
                (data) =>
                    (data as Data<unknown>[]).length === firstArray.length,
            )
        ) {
            return undefined;
        }

        return firstArray.map((_, i) => {
            const slice = datas.map(
                (data) => (data as Data<unknown>[])[i],
            ) as unknown as Data<any>[];
            return compare_data(slice, comp as any);
        }) as Data<O>;
    }

    // Check for object structures
    if (
        datas.every((data) => typeof data === "object" && !Array.isArray(data))
    ) {
        const keys = Object.keys(first);

        if (!datas.every((data) => Object.keys(data).length === keys.length)) {
            return undefined;
        }

        const result: { [key: string]: Data<O> } = {};

        for (const key of keys) {
            const slice = datas.map(
                (data) => (data as { [key: string]: Data<unknown> })[key],
            ) as unknown as Data<any>[];
            const nested = compare_data(slice, comp as any);
            if (nested === undefined) {
                return undefined;
            }
            result[key] = nested as Data<O>;
        }

        return result as Data<O>;
    }

    return undefined;
}
compare_data([1, 2, 3], ([a, b, c]) => a + b + c);
