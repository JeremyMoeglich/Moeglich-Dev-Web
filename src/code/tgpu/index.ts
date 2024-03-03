type Primitives =
    | "u64"
    | "i64"
    | "u32"
    | "i32"
    | "u16"
    | "i16"
    | "u8"
    | "i8"
    | "f64"
    | "f32"
    | "f16"
    | "bool";
type Devices = "js" | "webgl" | "webgpu";

class Tensor<S extends (number | "dyn")[], T extends Primitives> {
    shape: [...S];
    type: T;

    constructor(shape: [...S], type: T) {
        this.shape = shape;
        this.type = type;
    }
}

class Value<T extends Primitives> {
    type: T;

    constructor(type: T) {
        this.type = type;
    }
}

type MapToStructure<T, P extends Primitives> = T extends (number | "dyn")[]
    ? Tensor<T, P>
    : T extends number
      ? Value<P>
      : T extends boolean
          ? Value<"bool">
          : never;

export function gpufunction<T extends any[], D extends Devices[]>(
    devices: [...D],
    args: [...T],
    code: (
        ...args: {
            [K in keyof T]: MapToStructure<T[K], Primitives>;
        }
    ) => void,
) {}
