import type { GlslExpression } from "..";
import type { GlslBoolean } from "./glsl_boolean";
import type { GlslFloat } from "./glsl_float";
import { makeGlslVec4, wrap_vec4 } from "./literals";
import {
    type Trackable,
    arithmetic_proto,
    build_proto,
    gentype_proto,
    equality_proto,
    is_trackable,
} from "./proto";
import {
    type InferVecLength,
    type VecInferable,
    swizzle_from_index,
} from "./swizzle_util";

export type ToGlslVec4 =
    | [number, number, number, number]
    | number
    | GlslFloat
    | GlslVec4;
const GlslVec4Proto = build_proto([
    equality_proto(makeGlslVec4),
    arithmetic_proto(makeGlslVec4, wrap_vec4),
    gentype_proto(makeGlslVec4, wrap_vec4),
    {
        pick: function <N extends VecInferable<0 | 1 | 2 | 3>>(
            this: GlslVec4,
            index: N,
        ): InferVecLength<0 | 1 | 2 | 3, N> {
            return swizzle_from_index(this.origin, index);
        },
    },
]);
export const GlslVec4 = function (
    this: GlslVec4,
    value: GlslExpression | ToGlslVec4,
) {
    if (is_trackable(value, "vec4")) {
        this.origin = value.origin;
    } else if (is_trackable(value, "float")) {
        this.origin = {
            type: "function_call",
            name: "vec4",
            arguments: [value.origin],
        };
    } else if (typeof value === "number") {
        this.origin = {
            type: "function_call",
            name: "vec4",
            arguments: [
                {
                    type: "literal",
                    value: value,
                    literal_type: "float",
                },
            ],
        };
    } else if (Array.isArray(value)) {
        this.origin = {
            type: "function_call",
            name: "vec4",
            arguments: [
                {
                    type: "literal",
                    value: value[0],
                    literal_type: "float",
                },
                {
                    type: "literal",
                    value: value[1],
                    literal_type: "float",
                },
                {
                    type: "literal",
                    value: value[2],
                    literal_type: "float",
                },
            ],
        };
    } else {
        this.origin = value;
    }
    this.glsl_name = "vec4";
} as unknown as new (value: GlslExpression | ToGlslVec4) => GlslVec4;
Object.assign(GlslVec4.prototype, GlslVec4Proto);
export type GlslVec4 = Trackable<"vec4"> & {
    eq: (other: GlslVec4 | ToGlslVec4) => GlslBoolean;
    ne: (other: GlslVec4 | ToGlslVec4) => GlslBoolean;

    add: (other: GlslVec4 | ToGlslVec4) => GlslVec4;
    sub: (other: GlslVec4 | ToGlslVec4) => GlslVec4;
    mul: (other: GlslVec4 | ToGlslVec4) => GlslVec4;
    div: (other: GlslVec4 | ToGlslVec4) => GlslVec4;
    neg: () => GlslVec4;

    sin: () => GlslVec4;
    cos: () => GlslVec4;
    tan: () => GlslVec4;
    asin: () => GlslVec4;
    acos: () => GlslVec4;
    atan: () => GlslVec4;
    atan2: (other: GlslVec4 | number) => GlslVec4;

    pow: (other: GlslVec4 | number) => GlslVec4;
    exp: () => GlslVec4;
    log: () => GlslVec4;
    exp2: () => GlslVec4;
    log2: () => GlslVec4;
    sqrt: () => GlslVec4;
    inversesqrt: () => GlslVec4;

    abs: () => GlslVec4;
    sign: () => GlslVec4;
    floor: () => GlslVec4;
    ceil: () => GlslVec4;
    fract: () => GlslVec4;
    mod: (other: GlslVec4 | number) => GlslVec4;
    min: (other: GlslVec4 | number) => GlslVec4;
    max: (other: GlslVec4 | number) => GlslVec4;
    clamp: ((min: GlslVec4 | number, max: GlslVec4 | number) => GlslVec4) &
        ((min: number, max: number) => GlslVec4);
    mix: (other: GlslVec4 | number, ratio: GlslVec4 | number) => GlslVec4;
    step: (edge: GlslVec4 | number) => GlslVec4;
    smoothstep: ((
        edge0: GlslVec4 | number,
        edge1: GlslVec4 | number,
    ) => GlslVec4) &
        ((edge0: number, edge1: number) => GlslVec4);

    length: () => GlslFloat;
    distance: (other: GlslVec4 | ToGlslVec4) => GlslFloat;
    dot: (other: GlslVec4 | ToGlslVec4) => GlslFloat;
    normalize: () => GlslVec4;
    faceforward: (N: GlslVec4 | ToGlslVec4) => GlslVec4;
    reflect: (I: GlslVec4 | ToGlslVec4) => GlslVec4;
    refract: (I: GlslVec4 | ToGlslVec4, eta: GlslFloat) => GlslVec4;

    pick: <N extends VecInferable<0 | 1 | 2 | 3>>(
        index: N,
    ) => InferVecLength<0 | 1 | 2 | 3, N>;
} & {
    new (origin: GlslExpression): GlslVec4;
};
