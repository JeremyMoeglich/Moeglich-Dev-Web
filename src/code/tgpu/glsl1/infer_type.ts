import { panic } from "functional-utilities";
import type {
    GlslBinaryOperation,
    GlslExpression,
    GlslFloatType,
    GlslFullType,
    GlslFunctionCall,
    GlslUnaryOperation,
} from ".";

const default_float: GlslFloatType = { type: "float", precision: "default" };

function ident<T>(x: T): T {
    return x;
}

export function infer_glsl_type(
    vars: Map<string, GlslFullType>,
    expr: GlslExpression,
): GlslFullType {
    switch (expr.type) {
        case "literal":
            switch (expr.literal_type) {
                case "integer":
                    return { type: "int" };
                case "boolean":
                    return { type: "bool" };
                case "float":
                    return default_float;
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
            switch (expr.swizzle.length) {
                case 1:
                    return default_float;
                case 2:
                    return { type: "vec2", precision: "default" };
                case 3:
                    return { type: "vec3", precision: "default" };
                case 4:
                    return { type: "vec4", precision: "default" };
                default:
                    throw new Error("Invalid swizzle length");
            }
    }
}

function same_as_first_argument(
    names: string[],
): Record<string, (...args: GlslFullType[]) => GlslFullType> {
    const result: Record<string, (...args: GlslFullType[]) => GlslFullType> =
        {};
    for (const name of names) {
        result[name] = ident;
    }
    return result;
}

function vec_equivalent(
    to: "ivec" | "bvec",
): (t: GlslFullType) => GlslFullType {
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

const functions: Record<string, (...args: GlslFullType[]) => GlslFullType> = {
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

    length: () => default_float,
    distance: () => default_float,
    dot: () => default_float,
    cross: () => ({ type: "vec3", precision: "default" }),

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

    vec2: () => ({ type: "vec2", precision: "default" }),
    vec3: () => ({ type: "vec3", precision: "default" }),
    vec4: () => ({ type: "vec4", precision: "default" }),
};

const unary_operations: Record<
    GlslUnaryOperation["operation"],
    (v: GlslFullType) => GlslFullType
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
    (a: GlslFullType, b: GlslFullType) => GlslFullType
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

function infer_function_call(
    vars: Map<string, GlslFullType>,
    expr: GlslFunctionCall,
): GlslFullType {
    const f = functions[expr.name];
    if (!f) {
        throw new Error(`Unknown function ${expr.name}`);
    }
    const args = expr.arguments.map((arg) => infer_glsl_type(vars, arg));
    return f(...args);
}

function infer_unary_operation(
    vars: Map<string, GlslFullType>,
    expr: GlslUnaryOperation,
): GlslFullType {
    const f = unary_operations[expr.operation];
    if (!f) {
        throw new Error(`Unknown unary operation ${expr.operation}`);
    }
    const arg = infer_glsl_type(vars, expr.operand);
    return f(arg);
}

function infer_binary_operation(
    vars: Map<string, GlslFullType>,
    expr: GlslBinaryOperation,
): GlslFullType {
    const f = binary_operations[expr.operation];
    if (!f) {
        throw new Error(`Unknown binary operation ${expr.operation}`);
    }
    const a = infer_glsl_type(vars, expr.left);
    const b = infer_glsl_type(vars, expr.right);
    return f(a, b);
}
