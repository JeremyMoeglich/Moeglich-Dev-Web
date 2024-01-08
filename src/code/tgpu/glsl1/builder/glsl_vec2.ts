import type { GlslExpression } from "..";
import type { GlslBoolean } from "./glsl_boolean";
import type { GlslFloat } from "./glsl_float";
import { GlslVec3 } from "./glsl_vec3";
import { GlslVec4 } from "./glsl_vec4";
import { makeGlslVec2, wrap_vec2 } from "./literals";
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

export type ToGlslVec2 = [number, number] | number | GlslFloat | GlslVec2;
const GlslVec2Proto = build_proto([
    equality_proto(makeGlslVec2),
    arithmetic_proto(makeGlslVec2, wrap_vec2),
    gentype_proto(makeGlslVec2, wrap_vec2),
    {
        concat: function (
            this: GlslVec2,
            other: GlslVec2 | [number, number] | number | GlslFloat | [number],
        ) {
            if (is_trackable(other, "vec2")) {
                return new GlslVec4({
                    type: "function_call",
                    name: "vec4",
                    arguments: [this.origin, other.origin],
                });
            } else if (Array.isArray(other)) {
                if (other.length === 1) {
                    return new GlslVec3({
                        type: "function_call",
                        name: "vec3",
                        arguments: [
                            this.origin,
                            {
                                type: "literal",
                                value: other[0],
                                literal_type: "float",
                            },
                        ],
                    });
                } else {
                    return new GlslVec4({
                        type: "function_call",
                        name: "vec4",
                        arguments: [
                            this.origin,
                            {
                                type: "literal",
                                value: other[0],
                                literal_type: "float",
                            },
                            {
                                type: "literal",
                                value: other[1],
                                literal_type: "float",
                            },
                        ],
                    });
                }
            } else if (typeof other === "number") {
                return new GlslVec3({
                    type: "function_call",
                    name: "vec3",
                    arguments: [
                        this.origin,
                        {
                            type: "literal",
                            value: other,
                            literal_type: "float",
                        },
                    ],
                });
            } else {
                return new GlslVec3({
                    type: "function_call",
                    name: "vec3",
                    arguments: [this.origin, other.origin],
                });
            }
        } as ((
            this: GlslVec2,
            other: GlslVec2 | [number, number],
        ) => GlslVec4) &
            ((
                this: GlslVec2,
                other: number | GlslFloat | [number],
            ) => GlslVec3),
        pick: function <N extends VecInferable<0 | 1>>(
            this: GlslVec2,
            index: N,
        ): InferVecLength<0 | 1, N> {
            return swizzle_from_index(this.origin, index);
        },
    },
]);
export const GlslVec2 = function (
    this: GlslVec2,
    value: GlslExpression | ToGlslVec2,
) {
    if (is_trackable(value, "vec2")) {
        this.origin = value.origin;
    } else if (is_trackable(value, "float")) {
        this.origin = {
            type: "function_call",
            name: "vec2",
            arguments: [value.origin],
        };
    } else if (typeof value === "number") {
        this.origin = {
            type: "function_call",
            name: "vec2",
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
            name: "vec2",
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
            ],
        };
    } else {
        this.origin = value;
    }
    this.glsl_name = "vec2";
} as unknown as new (value: GlslExpression | ToGlslVec2) => GlslVec2;
Object.assign(GlslVec2.prototype, GlslVec2Proto);
export type GlslVec2 = Trackable<"vec2"> & {
    eq: (other: GlslVec2 | ToGlslVec2) => GlslBoolean;
    ne: (other: GlslVec2 | ToGlslVec2) => GlslBoolean;

    add: (other: GlslVec2 | ToGlslVec2) => GlslVec2;
    sub: (other: GlslVec2 | ToGlslVec2) => GlslVec2;
    mul: (other: GlslVec2 | ToGlslVec2) => GlslVec2;
    div: (other: GlslVec2 | ToGlslVec2) => GlslVec2;
    neg: () => GlslVec2;

    sin: () => GlslVec2;
    cos: () => GlslVec2;
    tan: () => GlslVec2;
    asin: () => GlslVec2;
    acos: () => GlslVec2;
    atan: () => GlslVec2;
    atan2: (other: GlslVec2 | number) => GlslVec2;

    pow: (other: GlslVec2 | number) => GlslVec2;
    exp: () => GlslVec2;
    log: () => GlslVec2;
    exp2: () => GlslVec2;
    log2: () => GlslVec2;
    sqrt: () => GlslVec2;
    inversesqrt: () => GlslVec2;

    abs: () => GlslVec2;
    sign: () => GlslVec2;
    floor: () => GlslVec2;
    ceil: () => GlslVec2;
    fract: () => GlslVec2;
    mod: (other: GlslVec2 | number) => GlslVec2;
    min: (other: GlslVec2 | number) => GlslVec2;
    max: (other: GlslVec2 | number) => GlslVec2;
    clamp: ((min: GlslVec2 | number, max: GlslVec2 | number) => GlslVec2) &
        ((min: number, max: number) => GlslVec2);
    mix: (other: GlslVec2 | number, ratio: GlslVec2 | number) => GlslVec2;
    step: (edge: GlslVec2 | number) => GlslVec2;
    smoothstep: ((
        edge0: GlslVec2 | number,
        edge1: GlslVec2 | number,
    ) => GlslVec2) &
        ((edge0: number, edge1: number) => GlslVec2);

    length: () => GlslFloat;
    distance: (other: GlslVec2 | ToGlslVec2) => GlslFloat;
    dot: (other: GlslVec2 | ToGlslVec2) => GlslFloat;
    normalize: () => GlslVec2;
    faceforward: (N: GlslVec2 | ToGlslVec2) => GlslVec2;
    reflect: (I: GlslVec2 | ToGlslVec2) => GlslVec2;
    refract: (I: GlslVec2 | ToGlslVec2, eta: GlslFloat) => GlslVec2;

    concat: ((other: GlslVec2 | [number, number]) => GlslVec4) &
        ((other: number | GlslFloat | [number]) => GlslVec3);
    pick: <N extends VecInferable<0 | 1>>(index: N) => InferVecLength<0 | 1, N>;
} & {
    new (origin: GlslExpression): GlslVec2;
};
