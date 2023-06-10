/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyFunction = (...args: any[]) => any;
type FuncReturnType<T extends AnyFunction> = T extends (
    ...args: any[]
) => infer R
    ? R
    : any;
export type Vectorized<T> = {
    [K in keyof T]: T[K] extends AnyFunction
        ? (...args: Parameters<T[K]>) => Vectorized<FuncReturnType<T[K]>>
        : T[K];
} & { toString(): string; objs: T[] } & Array<T>;

const nodeInspectSymbol = Symbol.for("nodejs.util.inspect.custom");
const denoInspectSymbol = Symbol.for("Deno.customInspect");

export function vectorize<T extends object>(objects: T[]): Vectorized<T> {
    const proxyHandler = {
        get(target: Vectorized<T>, prop: keyof Vectorized<T>) {
            if (
                prop === "toString" ||
                prop === Symbol.toPrimitive ||
                prop === "valueOf" ||
                prop === nodeInspectSymbol ||
                prop === denoInspectSymbol
            ) {
                return () => JSON.stringify(objects, null, 2);
            }
            if (prop === "objs") {
                return objects;
            }
            if (typeof prop === "symbol") {
                return target[prop];
            }
            if (!Number.isNaN(parseInt(prop as string))) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return objects[prop as number];
            }
            if (prop in Array.prototype) {
                if (
                    typeof Array.prototype[
                        prop as keyof typeof Array.prototype
                    ] === "function"
                ) {
                    // eslint-disable-next-line
                    return function (...args: any[]) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                        return Array.prototype[prop as keyof Array<any>].apply(
                            objects,
                            args
                        );
                    };
                } else {
                    return objects[prop as keyof Array<any>];
                }
            }

            return vectorize(objects.map((obj) => obj?.[prop as keyof T]));
        },
        apply: function (target: any, args: any) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            const results = objects.map((obj) => (obj as any)(...args));
            return vectorize(results);
        },
    };

    function functionProxy(this: any, ...args: any[]) {
        return proxyHandler.apply(this, args);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const proxy = new Proxy(
        functionProxy as unknown as Vectorized<T>,
        proxyHandler as any
    );
    return proxy;
}
