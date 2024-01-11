import type { GlslExpression } from "..";
import type { GlslBoolean } from "./glsl_boolean";
import type { GlslFloat } from "./glsl_float";
import { GlslVec4 } from "./glsl_vec4";
import { makeGlslFloat, makeGlslVec3, wrap_vec3 } from "./literals";
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

export type ToGlslVec3 =
    | [number, number, number]
    | number
    | GlslFloat
    | GlslVec3;
const GlslVec3Proto = build_proto([
    equality_proto(makeGlslVec3),
    arithmetic_proto(makeGlslVec3, wrap_vec3),
    gentype_proto(makeGlslVec3, wrap_vec3),
    {
        concat: function (
            this: GlslVec3,
            other: number | GlslFloat | [number],
        ) {
            return new GlslVec4({
                type: "function_call",
                name: "vec4",
                arguments: [
                    this.origin,
                    makeGlslFloat(Array.isArray(other) ? other[0] : other)
                        .origin,
                ],
            });
        },
        pick: function <N extends VecInferable<0 | 1 | 2>>(
            this: GlslVec3,
            index: N,
        ): InferVecLength<0 | 1 | 2, N> {
            return swizzle_from_index(this.origin, index);
        },
    },
]);
export const GlslVec3 = function (
    this: GlslVec3,
    value: GlslExpression | ToGlslVec3,
) {
    if (is_trackable(value, "vec3")) {
        this.origin = value.origin;
    } else if (is_trackable(value, "float")) {
        this.origin = {
            type: "function_call",
            name: "vec3",
            arguments: [value.origin],
        };
    } else if (typeof value === "number") {
        this.origin = {
            type: "function_call",
            name: "vec3",
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
            name: "vec3",
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
    this.glsl_name = "vec3";
} as unknown as new (value: GlslExpression | ToGlslVec3) => GlslVec3;
Object.assign(GlslVec3.prototype, GlslVec3Proto);
export type GlslVec3 = Trackable<"vec3"> & {
    eq: (other: GlslVec3 | ToGlslVec3) => GlslBoolean;
    ne: (other: GlslVec3 | ToGlslVec3) => GlslBoolean;

    add: (other: GlslVec3 | ToGlslVec3) => GlslVec3;
    sub: (other: GlslVec3 | ToGlslVec3) => GlslVec3;
    mul: (other: GlslVec3 | ToGlslVec3) => GlslVec3;
    div: (other: GlslVec3 | ToGlslVec3) => GlslVec3;
    neg: () => GlslVec3;

    sin: () => GlslVec3;
    cos: () => GlslVec3;
    tan: () => GlslVec3;
    asin: () => GlslVec3;
    acos: () => GlslVec3;
    atan: () => GlslVec3;
    atan2: (other: GlslVec3 | number) => GlslVec3;

    pow: (other: GlslVec3 | number) => GlslVec3;
    exp: () => GlslVec3;
    log: () => GlslVec3;
    exp2: () => GlslVec3;
    log2: () => GlslVec3;
    sqrt: () => GlslVec3;
    inversesqrt: () => GlslVec3;

    abs: () => GlslVec3;
    sign: () => GlslVec3;
    floor: () => GlslVec3;
    ceil: () => GlslVec3;
    fract: () => GlslVec3;
    mod: (other: GlslVec3 | number) => GlslVec3;
    min: (other: GlslVec3 | number) => GlslVec3;
    max: (other: GlslVec3 | number) => GlslVec3;
    clamp: ((min: GlslVec3 | number, max: GlslVec3 | number) => GlslVec3) &
        ((min: number, max: number) => GlslVec3);
    mix: (other: GlslVec3 | number, ratio: GlslVec3 | number) => GlslVec3;
    step: (edge: GlslVec3 | number) => GlslVec3;
    smoothstep: ((
        edge0: GlslVec3 | number,
        edge1: GlslVec3 | number,
    ) => GlslVec3) &
        ((edge0: number, edge1: number) => GlslVec3);

    length: () => GlslFloat;
    distance: (other: GlslVec3 | ToGlslVec3) => GlslFloat;
    dot: (other: GlslVec3 | ToGlslVec3) => GlslFloat;
    normalize: () => GlslVec3;
    faceforward: (N: GlslVec3 | ToGlslVec3) => GlslVec3;
    reflect: (I: GlslVec3 | ToGlslVec3) => GlslVec3;
    refract: (I: GlslVec3 | ToGlslVec3, eta: GlslFloat) => GlslVec3;

    concat: (other: number | GlslFloat | [number]) => GlslVec4;
    pick: <N extends VecInferable<0 | 1 | 2>>(
        index: N,
    ) => InferVecLength<0 | 1 | 2, N>;
} & {
    new (origin: GlslExpression): GlslVec3;
};
