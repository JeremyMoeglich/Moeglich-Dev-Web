import { panic } from "functional-utilities";
import {
    glslFloatingPointTypes,
    type GlslBinaryOperation,
    type GlslExpression,
    type GlslFloatingPointType,
    type GlslFullType,
    type GlslFunctionCall,
    type GlslUnaryOperation,
} from ".";

function ident<T>(x: T): T {
    return x;
}

export function infer_glsl_type<V extends 1 | 2>(
    vars: Map<string, GlslFullType<V>>,
    expr: GlslExpression,
): GlslFullType<V> {
    switch (expr.type) {
        case "literal":
            switch (expr.literal_type) {
                case "integer":
                    return { type: "int" };
                case "boolean":
                    return { type: "bool" };
                case "float":
                    return { type: "float", precision: "default" };
            }
        case "variable":
            return (
                vars.get(expr.name) ?? panic(`Variable ${expr.name} not found`)
            );
        case "array_access":
            const inner = infer_glsl_type(vars, expr.array);
            if (inner.type !== "array") {
                throw new Error("Not an array");
            }
            return inner.inner_type;
        case "function_call":
            return infer_function_call(vars, expr);
        case "unary_operation":
            return infer_unary_operation(vars, expr);
        case "binary_operation":
            return infer_binary_operation(vars, expr);
        case "swizzle":
            const expr_type = infer_glsl_type(vars, expr.vector);
            if (
                expr_type.type !== "vec2" &&
                expr_type.type !== "vec3" &&
                expr_type.type !== "vec4"
            ) {
                throw new Error("Not a vector");
            }
            switch (expr.swizzle.length) {
                case 1:
                    return { type: "float", precision: expr_type.precision };
                case 2:
                    return { type: "vec2", precision: expr_type.precision };
                case 3:
                    return { type: "vec3", precision: expr_type.precision };
                case 4:
                    return { type: "vec4", precision: expr_type.precision };
                default:
                    throw new Error("Invalid swizzle length");
            }
    }
}

function same_as_first_argument<V extends 1 | 2>(
    names: string[],
): Record<string, (...args: GlslFullType<V>[]) => GlslFullType<V>> {
    const result: Record<
        string,
        (...args: GlslFullType<V>[]) => GlslFullType<V>
    > = {};
    for (const name of names) {
        result[name] = ident;
    }
    return result;
}

function vec_equivalent<V extends 1 | 2>(
    to: "ivec" | "bvec",
): (t: GlslFullType<V>) => GlslFullType<V> {
    const bvec_map = {
        vec2: "bvec2",
        vec3: "bvec3",
        vec4: "bvec4",
    } as const;
    const ivec_map = {
        vec2: "ivec2",
        vec3: "ivec3",
        vec4: "ivec4",
    } as const;

    const used_map = to === "ivec" ? ivec_map : bvec_map;
    return (t) => {
        return {
            type: used_map[t.type as keyof typeof used_map],
        };
    };
}

function get_precision<V extends 1 | 2>(
    t: GlslFullType<V>,
): {
    type: GlslFloatingPointType<V>["type"];
    precision: GlslFloatingPointType<V>["precision"];
} {
    if (
        glslFloatingPointTypes.includes(
            t.type as (typeof glslFloatingPointTypes)[number],
        )
    ) {
        return {
            type: t.type as GlslFloatingPointType<V>["type"],
            precision: (t as GlslFloatingPointType<V>).precision,
        };
    }
    throw new Error(
        "Not a floating point value, this likely indicates a type error within the glsl",
    );
}

const glsl1_functions: Record<
    string,
    (...args: GlslFullType<1>[]) => GlslFullType<1>
> = {
    // prettier-ignore
    ...same_as_first_argument([
        "radians", "degrees", "sin", "cos", "tan", "asin", "acos", "atan",
        "pow", "exp", "log", "exp2", "log2", "sqrt", "inversesqrt",
        "abs", "sign", "floor", "ceil", "fract", "mod", "min", "max", "clamp", "mix",
        "normalize", "faceforward", "reflect", "refract",
        "matrixCompMult"
    ]),
    step: (_, b) => b,
    smoothstep: (_a, _b, c) => c,

    length: (t) => ({ type: "float", precision: get_precision(t).precision }),
    distance: (t) => ({ type: "float", precision: get_precision(t).precision }),
    dot: (t) => ({ type: "float", precision: get_precision(t).precision }),
    cross: (t) => ({ type: "vec3", precision: get_precision(t).precision }),

    lessThan: vec_equivalent("bvec"),
    lessThanEqual: vec_equivalent("bvec"),
    greaterThan: vec_equivalent("bvec"),
    greaterThanEqual: vec_equivalent("bvec"),
    equal: vec_equivalent("bvec"),
    notEqual: vec_equivalent("bvec"),
    any: () => ({ type: "bool" }),
    all: () => ({ type: "bool" }),
    not: () => ({ type: "bool" }),

    texture2D: () => ({ type: "vec4", precision: "default" }),
    texture2DProj: () => ({ type: "vec4", precision: "default" }),
    texture2DLod: () => ({ type: "vec4", precision: "default" }),
    texture2DProjLod: () => ({ type: "vec4", precision: "default" }),
    textureCube: () => ({ type: "vec4", precision: "default" }),
    textureCubeLod: () => ({ type: "vec4", precision: "default" }),

    vec2: (t) => ({ type: "vec2", precision: get_precision(t).precision }),
    vec3: (t) => ({ type: "vec3", precision: get_precision(t).precision }),
    vec4: (t) => ({ type: "vec4", precision: get_precision(t).precision }),
};

const unary_operations: Record<
    GlslUnaryOperation["operation"],
    (v: GlslFullType<1>) => GlslFullType<1>
> = {
    "!": () => ({ type: "bool" }),
    "-": ident,
    "+": ident,
    "post++": ident,
    "post--": ident,
    "pre++": ident,
    "pre--": ident,
    "~": ident,
};

const binary_operations: Record<
    GlslBinaryOperation["operation"],
    (a: GlslFullType<1>, b: GlslFullType<1>) => GlslFullType<1>
> = {
    "!=": () => ({ type: "bool" }),
    "&&": () => ({ type: "bool" }),
    "||": () => ({ type: "bool" }),
    "*": ident,
    "/": ident,
    "%": ident,
    "+": ident,
    "-": ident,
    "<<": ident,
    ">>": ident,
    "&": ident,
    "^": ident,
    "<": () => ({ type: "bool" }),
    ">": () => ({ type: "bool" }),
    "<=": () => ({ type: "bool" }),
    "==": () => ({ type: "bool" }),
    ">=": () => ({ type: "bool" }),
    "|": ident,
    "^^": ident,
};

function infer_function_call<V extends 1 | 2>(
    vars: Map<string, GlslFullType<V>>,
    expr: GlslFunctionCall,
): GlslFullType<V> {
    const f = glsl1_functions[expr.name];
    if (!f) {
        throw new Error(`Unknown function ${expr.name}`);
    }
    const args = expr.arguments.map((arg) => infer_glsl_type(vars, arg));
    return f(...args);
}

function infer_unary_operation<V extends 1 | 2>(
    vars: Map<string, GlslFullType<V>>,
    expr: GlslUnaryOperation,
): GlslFullType<V> {
    const f = unary_operations[expr.operation];
    if (!f) {
        throw new Error(`Unknown unary operation ${expr.operation}`);
    }
    const arg = infer_glsl_type(vars, expr.operand);
    return f(arg);
}

function infer_binary_operation<V extends 1 | 2>(
    vars: Map<string, GlslFullType<V>>,
    expr: GlslBinaryOperation,
): GlslFullType<V> {
    const f = binary_operations[expr.operation];
    if (!f) {
        throw new Error(`Unknown binary operation ${expr.operation}`);
    }
    const a = infer_glsl_type(vars, expr.left);
    const b = infer_glsl_type(vars, expr.right);
    return f(a, b);s
}
