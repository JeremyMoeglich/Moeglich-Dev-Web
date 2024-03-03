import { point_map_bundler } from "./shapelib/types/interfaces/pointmap";
import { renderable_bundler } from "./shapelib/types/interfaces/renderable";
import { bounding_box_bundler } from "./shapelib/types/interfaces/boundingbox";
import { transformable_bundler } from "./shapelib/types/interfaces/transformable";
import { stringifiable_bundler } from "./shapelib/types/interfaces/stringifiable";
import { has_area_bundler } from "./shapelib/types/interfaces/hasarea";
import { has_length_bundler } from "./shapelib/types/interfaces/haslength";
import { has_vertices_bundler } from "./shapelib/types/interfaces/hasvertices";
import { interpolate_bundler } from "./funcs/interpolator";

type AddFirstArgument<T, A> = {
    [K in keyof T]: T[K] extends (...args: infer U) => infer R
        ? (a: A, ...args: U) => R
        : T[K];
};

type ReplaceFirstArgument<T, R> = {
    [K in keyof T]: T[K] extends (a: infer _U, ...args: infer V) => infer W
        ? (a: R, ...args: V) => W
        : T[K];
};

type ReplaceThisArg<T, R> = {
    [K in keyof T]: T[K] extends (this: infer U, ...args: infer V) => infer W
        ? U extends T
            ? (this: R, ...args: V) => W
            : T[K]
        : T[K];
};

type MapThis<T, R> = ReplaceThisArg<T, R>;

export interface Bundler<I extends object, T extends object> {
    isType: (value: any) => value is I;
    functionality: MapThis<AddFirstArgument<T, I[]>, I[]>;
}

type OmitFirstArg<F> = F extends (x: any, ...args: infer A) => infer R
    ? (...args: A) => R
    : never;

function bindFirstArgumentToThis<F extends (x: any, ...args: any) => any>(
    fn: F,
): OmitFirstArg<F> {
    return function (
        this: Parameters<F>[0],
        ...args: Parameters<OmitFirstArg<F>>
    ) {
        return fn.call(this, this.objs, ...args);
    } as OmitFirstArg<F>;
}

const bundlers = [
    stringifiable_bundler,
    renderable_bundler,
    point_map_bundler,
    bounding_box_bundler,
    transformable_bundler,
    has_area_bundler,
    has_length_bundler,
    has_vertices_bundler,
    interpolate_bundler,
] as const;

type MapBundler<T extends Bundler<any, any>> = {
    isType: T["isType"];
    functionality: {
        [P in keyof T["functionality"]]: OmitFirstArg<T["functionality"][P]>;
    };
};
type MapTupleTypes<T extends Bundler<any, any>[]> = {
    [P in keyof T]: MapBundler<T[P]>;
};
type ThisBundlersObjectType = MapTupleTypes<Writable<typeof bundlers>>;

type Writable<T> = {
    -readonly [P in keyof T]: T[P];
};

const this_bundlers = bundlers.map((bundler) => {
    return {
        isType: bundler.isType,
        functionality: Object.fromEntries(
            Object.entries(bundler.functionality).map(([key, value]) => {
                return [key, bindFirstArgumentToThis(value)];
            }),
        ),
    };
}) as ThisBundlersObjectType;

type GuardedType<T> = T extends (x: any) => x is infer G ? G : never;

type ReplaceThisReturn<T, R> = {
    [K in keyof T]: T[K] extends (...args: infer V) => infer W
        ? W extends ThisReturn
            ? (...args: V) => Bundle<R> & ThisReturn
            : T[K]
        : T[K];
};

type BundlerType<B extends Bundler<any, any>> = GuardedType<B["isType"]>;

type ApplicableFunctionality<
    B extends Bundler<any, any>,
    T,
> = T extends BundlerType<B>
    ? ReplaceThisReturn<B["functionality"], T>
    : Record<string, never>;

type AccumulatedBundle<T, Bs extends Array<Bundler<any, any>>> = Bs extends [
    infer B,
    ...infer Rest,
]
    ? B extends Bundler<any, any>
        ? ApplicableFunctionality<B, T> &
              AccumulatedBundle<
                  T,
                  Rest extends Array<Bundler<any, any>> ? Rest : []
              >
        : never
    : Record<string, never>;

export type Bundle<T> = (T extends any // This maps each union type in T seperately. This technically doesn't change the type, but it avoids exponential complexity. Without this takes hours even for just 4 types.
    ? AccumulatedBundle<T, typeof this_bundlers>
    : never) & {
    objs: T[];
    map_objs: <R>(fn: (obj: T) => R) => Bundle<R>;
};

// Initialize the shared prototype just once
const sharedPrototype: any = {};
for (const bundler of this_bundlers) {
    Object.assign(sharedPrototype, bundler.functionality);
}

export function createBundle<T>(values: T[]) {
    const object: any = {
        objs: values,
        map_objs: function (this: Bundle<T>, fn: (obj: T) => any) {
            return createBundle(this.objs.map(fn));
        },
    };

    Object.setPrototypeOf(object, sharedPrototype); // This technically means that objects gain methods that don't work, but it's fine as their not part of the type.
    return object as Bundle<T> & ThisReturn;
}

export function emptyBundle<T>(template: T): Bundle<T> {
    const bundle = createBundle([template]);
    bundle.objs = [] as never;
    return bundle;
}

export function is_bundle<T>(
    value: unknown,
    isType: (value: unknown) => value is T,
): value is Bundle<T> {
    return (
        typeof value === "object" &&
        value !== null &&
        "objs" in value &&
        Array.isArray(value.objs) &&
        value.objs.every((obj) => isType(obj))
    );
}

export type ThisReturn = { _this: true };
export type UnMarkThis<T extends object> = Omit<T, "_this">;
export function mark_this<T extends object>(obj: T): T & ThisReturn {
    return obj as T & ThisReturn;
}
export function unmark_this<T extends object & ThisReturn>(
    obj: T,
): UnMarkThis<T> {
    return obj as UnMarkThis<T>;
}

export function rebundle_functionality<
    B extends Bundler<any, any>,
    O extends BundlerType<B>,
>(
    bundler: B,
): ReplaceFirstArgument<ReplaceThisReturn<B["functionality"], O>, O[]> {
    return bundler.functionality as ReplaceFirstArgument<
        ReplaceThisReturn<B["functionality"], O>,
        O[]
    >;
}
