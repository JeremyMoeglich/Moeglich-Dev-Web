import type { GlslExpression } from "..";
import type { GlslBoolean } from "./glsl_boolean";
import { GlslVec2 } from "./glsl_vec2";
import { GlslVec3 } from "./glsl_vec3";
import { GlslVec4 } from "./glsl_vec4";
import { makeGlslFloat, wrap_float } from "./literals";
import {
    type Trackable,
    arithmetic_proto,
    build_proto,
    relation_proto,
    gentype_proto,
    equality_proto,
    is_trackable,
} from "./proto";

export type ToGlslFloat = number | GlslFloat;
const GlslFloatProto = build_proto([
    equality_proto(makeGlslFloat),
    relation_proto(makeGlslFloat),
    arithmetic_proto(makeGlslFloat, wrap_float),
    gentype_proto(makeGlslFloat, wrap_float),
    {
        to_vec2: function (this: GlslFloat) {
            return new GlslVec2({
                type: "function_call",
                name: "vec2",
                arguments: [this.origin],
            });
        },
        to_vec3: function (this: GlslFloat) {
            return new GlslVec3({
                type: "function_call",
                name: "vec3",
                arguments: [this.origin],
            });
        },
        to_vec4: function (this: GlslFloat) {
            return new GlslVec4({
                type: "function_call",
                name: "vec4",
                arguments: [this.origin],
            });
        },
        concat: function (
            this: GlslFloat,
            other:
                | GlslFloat
                | number
                | GlslVec2
                | GlslVec3
                | [number]
                | [number, number]
                | [number, number, number],
        ) {
            if (is_trackable(other, "vec2")) {
                return new GlslVec3({
                    type: "function_call",
                    name: "vec3",
                    arguments: [this.origin, other.origin],
                });
            }
            if (is_trackable(other, "vec3")) {
                return new GlslVec4({
                    type: "function_call",
                    name: "vec4",
                    arguments: [this.origin, other.origin],
                });
            }
            if (typeof other === "number") {
                return new GlslVec2({
                    type: "function_call",
                    name: "vec2",
                    arguments: [
                        this.origin,
                        {
                            type: "literal",
                            value: other,
                            literal_type: "float",
                        },
                    ],
                });
            }
            if (Array.isArray(other)) {
                if (other.length === 1) {
                    return new GlslVec2({
                        type: "function_call",
                        name: "vec2",
                        arguments: [
                            this.origin,
                            {
                                type: "literal",
                                value: other[0],
                                literal_type: "float",
                            },
                        ],
                    });
                }
                if (other.length === 2) {
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
                            {
                                type: "literal",
                                value: other[1],
                                literal_type: "float",
                            },
                        ],
                    });
                }
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
                        {
                            type: "literal",
                            value: other[2],
                            literal_type: "float",
                        },
                    ],
                });
            }
            return new GlslVec2({
                type: "function_call",
                name: "vec2",
                arguments: [this.origin, other.origin],
            });
        } as ((
            this: GlslFloat,
            other: GlslFloat | number | [number],
        ) => GlslVec2) &
            ((
                this: GlslFloat,
                other: GlslVec2 | [number, number],
            ) => GlslVec3) &
            ((
                this: GlslFloat,
                other: GlslVec3 | [number, number, number],
            ) => GlslVec4),
    },
]);
export const GlslFloat = function (
    this: GlslFloat,
    value: GlslExpression | ToGlslFloat,
) {
    if (is_trackable(value, "float")) {
        this.origin = value.origin;
    } else if (typeof value === "number") {
        this.origin = {
            type: "literal",
            value: value,
            literal_type: "float",
        };
    } else {
        this.origin = value;
    }
    this.glsl_name = "float";
} as unknown as new (
    value: GlslExpression | ToGlslFloat,
) => GlslFloat;
Object.assign(GlslFloat.prototype, GlslFloatProto);
export type GlslFloat = Trackable<"float"> & {
    eq: (other: GlslFloat | number) => GlslBoolean;
    ne: (other: GlslFloat | number) => GlslBoolean;
    lt: (other: GlslFloat | number) => GlslBoolean;
    le: (other: GlslFloat | number) => GlslBoolean;
    gt: (other: GlslFloat | number) => GlslBoolean;
    ge: (other: GlslFloat | number) => GlslBoolean;

    add: (other: GlslFloat | number) => GlslFloat;
    sub: (other: GlslFloat | number) => GlslFloat;
    mul: (other: GlslFloat | number) => GlslFloat;
    div: (other: GlslFloat | number) => GlslFloat;
    neg: () => GlslFloat;

    sin: () => GlslFloat;
    cos: () => GlslFloat;
    tan: () => GlslFloat;
    asin: () => GlslFloat;
    acos: () => GlslFloat;
    atan: () => GlslFloat;
    atan2: (other: GlslFloat | number) => GlslFloat;

    pow: (other: GlslFloat | number) => GlslFloat;
    exp: () => GlslFloat;
    log: () => GlslFloat;
    exp2: () => GlslFloat;
    log2: () => GlslFloat;
    sqrt: () => GlslFloat;
    inversesqrt: () => GlslFloat;

    abs: () => GlslFloat;
    sign: () => GlslFloat;
    floor: () => GlslFloat;
    ceil: () => GlslFloat;
    fract: () => GlslFloat;
    mod: (other: GlslFloat | number) => GlslFloat;
    min: (other: GlslFloat | number) => GlslFloat;
    max: (other: GlslFloat | number) => GlslFloat;
    clamp: ((min: GlslFloat | number, max: GlslFloat | number) => GlslFloat) &
        ((min: number, max: number) => GlslFloat);
    mix: (other: GlslFloat | number, ratio: GlslFloat | number) => GlslFloat;
    step: (edge: GlslFloat | number) => GlslFloat;
    smoothstep: ((
        edge0: GlslFloat | number,
        edge1: GlslFloat | number,
    ) => GlslFloat) &
        ((edge0: number, edge1: number) => GlslFloat);

    length: () => GlslFloat;
    distance: (other: GlslFloat | number) => GlslFloat;
    dot: (other: GlslFloat | number) => GlslFloat;
    cross: (other: GlslFloat | number) => GlslFloat;
    normalize: () => GlslFloat;
    faceforward: (N: GlslFloat | number, I: GlslFloat | number) => GlslFloat;
    reflect: (N: GlslFloat | number) => GlslFloat;
    refract: (N: GlslFloat | number, eta: GlslFloat | number) => GlslFloat;

    to_vec2: () => GlslVec2;
    to_vec3: () => GlslVec3;
    to_vec4: () => GlslVec4;
    concat: ((other: GlslFloat | number | [number]) => GlslVec2) &
        ((other: GlslVec2 | [number, number]) => GlslVec3) &
        ((other: GlslVec3 | [number, number, number]) => GlslVec4);
} & {
    new (origin: GlslExpression): GlslFloat;
};
