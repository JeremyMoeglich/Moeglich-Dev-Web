type AnyFunction = (...args: any[]) => any;
type FuncReturnType<T extends AnyFunction> = T extends (...args: any[]) => infer R ? R : any;
type Bundle<T> = {
    [K in keyof T]: T[K] extends AnyFunction ? (...args: Parameters<T[K]>) => Bundle<FuncReturnType<T[K]>> : Bundle<T[K]>;
} & { toString(): string, objs: T[] } & Array<T>;

function createBundle<T extends object>(objects: T[]): Bundle<T> {
    return new Proxy({} as Bundle<T>, {
        get(target, prop) {
            if (prop === 'toString') {
                return () => JSON.stringify(objects, null, 2);  // pretty-print
            }
            if (prop === 'objs') {
                return objects;
            }
            if (typeof prop === 'number' || prop === 'length' || (typeof Array.prototype[prop] === 'function')) {
                return Reflect.get(objects, prop);
            }

            const firstObject = objects[0];
            if (firstObject === undefined) {
                return createBundle([]);
            }
            const firstProp = firstObject[prop as keyof T];

            if (typeof firstProp === 'function') {
                return (...args: any[]) => createBundle(objects.map(obj => (obj[prop as keyof T] as any)(...args)));
            }

            return createBundle(objects.map(obj => obj[prop as keyof T]));
        },
    });
}

// Example usage:
interface Test {
    prop: number;
    method(): string;
    voidMethod(): void;
}

let bundle: Bundle<Test> = createBundle([{ prop: 1, method: () => 'a', voidMethod: () => { } }, { prop: 2, method: () => 'b', voidMethod: () => { } }]);

console.log(bundle.prop.toString()); // Outputs: Bundle([1, 2])
console.log(bundle.method()); // Outputs: Bundle(["a", "b"])
console.log(bundle.voidMethod()); // Outputs: Bundle([undefined, undefined])