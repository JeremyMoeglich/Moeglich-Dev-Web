/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
    GlslBinaryOperation,
    GlslExpression,
    GlslTypeName,
    GlslUnaryOperation,
} from "..";
import type { UnionToIntersection } from "../type_util";
import { type GlslBoolean } from "./glsl_boolean";
import { type GlslFloat } from "./glsl_float";
import { makeGlslFloat, wrap_bool, wrap_float } from "./literals";

export type Trackable<T extends GlslTypeName> = {
    origin: GlslExpression;
    glsl_name: T;
};
export function is_trackable<T extends GlslTypeName>(
    v: unknown,
    glsl_name: T,
): v is Trackable<T> {
    return (
        !!v &&
        typeof v === "object" &&
        "origin" in v &&
        "glsl_name" in v &&
        v.glsl_name === glsl_name
    );
}

function this_op_binary<
    Literal,
    Tracked extends { origin: GlslExpression },
    Wrapped,
>(
    literal: (v: Literal | Tracked) => Tracked,
    operation: GlslBinaryOperation["operation"],
    wrap: (v: GlslExpression) => Wrapped,
) {
    return function (this: Tracked, other: Tracked | Literal) {
        return wrap({
            type: "binary_operation",
            operation: operation,
            left: this.origin,
            right: literal(other).origin,
        });
    };
}

function this_op_unary<Tracked extends { origin: GlslExpression }, Wrapped>(
    operation: GlslUnaryOperation["operation"],
    wrap: (v: GlslExpression) => Wrapped,
) {
    return function (this: Tracked) {
        return wrap({
            type: "unary_operation",
            operation: operation,
            operand: this.origin,
        });
    };
}

function this_op_unary_call<
    Tracked extends { origin: GlslExpression },
    Wrapped,
>(name: string, wrap: (v: GlslExpression) => Wrapped) {
    return function (this: Tracked) {
        return wrap({
            type: "function_call",
            name,
            arguments: [this.origin],
        });
    };
}

function this_op_binary_call<
    Literal,
    Tracked extends { origin: GlslExpression },
    Wrapped,
>(
    literal: (v: Literal | Tracked) => Tracked,
    name: string,
    wrap: (v: GlslExpression) => Wrapped,
) {
    return function (this: Tracked, other: Tracked | Literal) {
        return wrap({
            type: "function_call",
            name,
            arguments: [this.origin, literal(other).origin],
        });
    };
}

function this_op_binary_call_float<
    Literal,
    Tracked extends { origin: GlslExpression },
    Wrapped,
>(
    literal: (v: Literal | Tracked) => Tracked,
    name: string,
    wrap: (v: GlslExpression) => Wrapped,
) {
    return function (this: Tracked, other: Tracked | Literal | number) {
        return wrap({
            type: "function_call",
            name,
            arguments: [
                this.origin,
                typeof other === "number"
                    ? makeGlslFloat(other).origin
                    : literal(other).origin,
            ],
        });
    };
}

export function equality_proto<
    Literal,
    Tracked extends { origin: GlslExpression },
>(literal: (v: Literal | Tracked) => Tracked) {
    return {
        eq: this_op_binary(literal, "==", wrap_bool),
        ne: this_op_binary(literal, "!=", wrap_bool),
    };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type EqualityProtoType<T> = {
    eq: (other: T) => GlslBoolean;
    ne: (other: T) => GlslBoolean;
};

export function relation_proto<
    Literal,
    Tracked extends { origin: GlslExpression },
>(literal: (v: Literal | Tracked) => Tracked) {
    return {
        lt: this_op_binary(literal, "<", wrap_bool),
        le: this_op_binary(literal, "<=", wrap_bool),
        gt: this_op_binary(literal, ">", wrap_bool),
        ge: this_op_binary(literal, ">=", wrap_bool),
    };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type RelationProtoType<T> = {
    lt: (other: T) => GlslBoolean;
    le: (other: T) => GlslBoolean;
    gt: (other: T) => GlslBoolean;
    ge: (other: T) => GlslBoolean;
};

export function arithmetic_proto<
    Literal,
    Tracked extends { origin: GlslExpression },
>(
    literal: (v: Literal | Tracked) => Tracked,
    wrap: (v: GlslExpression) => Tracked,
) {
    return {
        add: this_op_binary(literal, "+", wrap),
        sub: this_op_binary(literal, "-", wrap),
        mul: this_op_binary(literal, "*", wrap),
        div: this_op_binary(literal, "/", wrap),
        neg: this_op_unary("-", wrap),
    };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ArithmeticProtoType<T> = {
    add: (other: T) => T;
    sub: (other: T) => T;
    mul: (other: T) => T;
    div: (other: T) => T;
    neg: () => T;
};

export function boolean_proto<
    Literal,
    Tracked extends { origin: GlslExpression },
>(literal: (v: Literal | Tracked) => Tracked) {
    return {
        and: this_op_binary(literal, "&&", wrap_bool),
        or: this_op_binary(literal, "||", wrap_bool),
        not: this_op_unary("!", wrap_bool),
    };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type BooleanProtoType<T> = {
    and: (other: T) => T;
    or: (other: T) => T;
    not: () => T;
};

// Applies to float, vec2, vec3, vec4, mat2, mat3, mat4
export function gentype_proto<
    Literal,
    Tracked extends { origin: GlslExpression },
>(
    literal: (v: Literal | Tracked) => Tracked,
    wrap: (v: GlslExpression) => Tracked,
) {
    return {
        // trigonometric functions
        sin: this_op_unary_call("sin", wrap),
        cos: this_op_unary_call("cos", wrap),
        tan: this_op_unary_call("tan", wrap),
        asin: this_op_unary_call("asin", wrap),
        acos: this_op_unary_call("acos", wrap),
        atan: this_op_unary_call("atan", wrap),
        atan2: this_op_binary_call(literal, "atan", wrap),

        // exponential functions
        pow: this_op_binary_call(literal, "pow", wrap),
        exp: this_op_unary_call("exp", wrap),
        log: this_op_unary_call("log", wrap),
        exp2: this_op_unary_call("exp2", wrap),
        log2: this_op_unary_call("log2", wrap),
        sqrt: this_op_unary_call("sqrt", wrap),
        inversesqrt: this_op_unary_call("inversesqrt", wrap),

        // common functions
        abs: this_op_unary_call("abs", wrap),
        sign: this_op_unary_call("sign", wrap),
        floor: this_op_unary_call("floor", wrap),
        ceil: this_op_unary_call("ceil", wrap),
        fract: this_op_unary_call("fract", wrap),
        mod: this_op_binary_call_float(literal, "mod", wrap),
        min: this_op_binary_call_float(literal, "min", wrap),
        max: this_op_binary_call_float(literal, "max", wrap),
        clamp: function (
            this: Tracked,
            min: Tracked | Literal | number,
            max: Tracked | Literal | number,
        ) {
            return wrap({
                type: "function_call",
                name: "clamp",
                arguments: [
                    this.origin,
                    typeof min === "number"
                        ? makeGlslFloat(min).origin
                        : literal(min).origin,
                    typeof max === "number"
                        ? makeGlslFloat(max).origin
                        : literal(max).origin,
                ],
            });
        } as ((
            this: Tracked,
            min: Tracked | Literal,
            max: Tracked | Literal,
        ) => Tracked) &
            ((this: Tracked, min: number, max: number) => Tracked),
        mix: function (
            this: Tracked,
            other: Tracked | Literal,
            ratio: Tracked | Literal | number,
        ) {
            return wrap({
                type: "function_call",
                name: "mix",
                arguments: [
                    this.origin,
                    literal(other).origin,
                    typeof ratio === "number"
                        ? makeGlslFloat(ratio).origin
                        : literal(ratio).origin,
                ],
            });
        },
        step: function (this: Tracked, edge: Tracked | Literal | number) {
            return wrap({
                type: "function_call",
                name: "step",
                arguments: [
                    typeof edge === "number"
                        ? makeGlslFloat(edge).origin
                        : literal(edge).origin,
                    this.origin,
                ],
            });
        },
        smoothstep: function (
            this: Tracked,
            edge0: Tracked | Literal | number,
            edge1: Tracked | Literal | number,
        ) {
            return wrap({
                type: "function_call",
                name: "smoothstep",
                arguments: [
                    typeof edge0 === "number"
                        ? makeGlslFloat(edge0).origin
                        : literal(edge0).origin,
                    typeof edge1 === "number"
                        ? makeGlslFloat(edge1).origin
                        : literal(edge1).origin,
                ],
            });
        } as ((
            this: Tracked,
            edge0: Tracked | Literal,
            edge1: Tracked | Literal,
        ) => Tracked) &
            ((this: Tracked, edge0: number, edge1: number) => Tracked),

        // geometric functions
        length: this_op_unary_call("length", wrap_float),
        distance: this_op_binary_call(literal, "distance", wrap_float),
        dot: this_op_binary_call(literal, "dot", wrap_float),
        normalize: this_op_unary_call("normalize", wrap),
        faceforward: function (
            this: Tracked,
            N: Tracked | Literal,
            I: Tracked | Literal,
        ) {
            return wrap({
                type: "function_call",
                name: "faceforward",
                arguments: [literal(N).origin, literal(I).origin, this.origin],
            });
        },
        reflect: this_op_binary_call(literal, "reflect", wrap),
        refract: function (
            this: Tracked,
            N: Tracked | Literal,
            eta: number | GlslFloat,
        ) {
            return wrap({
                type: "function_call",
                name: "refract",
                arguments: [
                    this.origin,
                    literal(N).origin,
                    typeof eta === "number"
                        ? makeGlslFloat(eta).origin
                        : eta.origin,
                ],
            });
        },
    };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type GentypeProtoType<T> = {
    sin: () => T;
    cos: () => T;
    tan: () => T;
    asin: () => T;
    acos: () => T;
    atan: () => T;
    atan2: (other: T) => T;

    pow: (other: T) => T;
    exp: () => T;
    log: () => T;
    exp2: () => T;
    log2: () => T;
    sqrt: () => T;
    inversesqrt: () => T;

    abs: () => T;
    sign: () => T;
    floor: () => T;
    ceil: () => T;
    fract: () => T;
    mod: (other: T) => T;
    min: (other: T) => T;
    max: (other: T) => T;
    clamp: ((min: T, max: T) => T) & ((min: number, max: number) => T);
    mix: (other: T, ratio: T | number) => T;
    step: (edge: T | number) => T;
    smoothstep: ((edge0: T, edge1: T) => T) &
        ((edge0: number, edge1: number) => T);

    length: () => GlslFloat;
    distance: (other: T) => GlslFloat;
    dot: (other: T) => GlslFloat;
    normalize: () => T;
    faceforward: (N: T, I: T) => T;
    reflect: (I: T) => T;
    refract: (N: T, eta: number | GlslFloat) => T;
};

export function build_proto<Proto>(
    protos: Proto[],
): UnionToIntersection<Proto> {
    return protos.reduce(
        (a, b) => Object.assign(a, b),
        {},
    ) as UnionToIntersection<Proto>;
}
