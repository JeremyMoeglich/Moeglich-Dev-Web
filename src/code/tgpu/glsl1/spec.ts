/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
// https://registry.khronos.org/OpenGL/specs/es/2.0/GLSL_ES_Specification_1.00.pdf
// https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf

export type GlslShaderKind = "vertex" | "fragment";

export type GlslLiteral =
    | {
          literal_type: "integer";
          value: number;
      }
    | {
          literal_type: "float";
          value: number;
      }
    | {
          literal_type: "boolean";
          value: boolean;
      };

function build_glsl_integer(integer: number): string {
    if (!Number.isInteger(integer)) {
        throw new Error(`Invalid integer value: ${integer}`);
    }
    return `${integer}`;
}

function build_glsl_literal(literal: GlslLiteral): string {
    switch (literal.literal_type) {
        case "integer":
            return build_glsl_integer(literal.value);
        case "float":
            return `${literal.value}`;
        case "boolean":
            return `${literal.value}`;
    }
}

export type GlslArrayAccess = {
    array: GlslExpression;
    index: GlslExpression;
};

function build_glsl_array_access(array_access: GlslArrayAccess): string {
    return `${build_glsl_expression(
        array_access.array,
    )}[${build_glsl_expression(array_access.index)}]`;
}

export type GlslFunctionCall = {
    name: string;
    arguments: GlslExpression[];
};

function build_glsl_function_call(function_call: GlslFunctionCall): string {
    return `${function_call.name}(${function_call.arguments
        .map(build_glsl_expression)
        .join(", ")})`;
}
export type GlslVariableReference = {
    name: string;
};

export type GlslSwizzle = {
    vector: GlslExpression;
    swizzle: string;
};

function build_glsl_swizzle(swizzle: GlslSwizzle): string {
    return `${build_glsl_expression(swizzle.vector)}.${swizzle.swizzle}`;
}

export type GlslExpression =
    | ({
          type: "variable";
      } & GlslVariableReference)
    | ({
          type: "binary_operation";
      } & GlslBinaryOperation)
    | ({
          type: "unary_operation";
      } & GlslUnaryOperation)
    | ({
          type: "function_call";
      } & GlslFunctionCall)
    | ({
          type: "array_access";
      } & GlslArrayAccess)
    | ({
          type: "literal";
      } & GlslLiteral)
    | ({
          type: "swizzle";
      } & GlslSwizzle);

export function build_glsl_expression(expression: GlslExpression): string {
    switch (expression.type) {
        case "variable":
            return build_glsl_identifier(expression.name);
        case "binary_operation":
            return build_glsl_binary_operation(expression);
        case "unary_operation":
            return build_glsl_unary_operation(expression);
        case "function_call":
            return build_glsl_function_call(expression);
        case "array_access":
            return build_glsl_array_access(expression);
        case "literal":
            return build_glsl_literal(expression);
        case "swizzle":
            return build_glsl_swizzle(expression);
    }
}

export type GlslBinaryOperation = {
    operation: GlslBinaryOperationType;
    left: GlslExpression;
    right: GlslExpression;
};

export type GlslBinaryOperationType =
    | "*"
    | "/"
    | "%"
    | "+"
    | "-"
    | "<<"
    | ">>"
    | "<"
    | "<="
    | ">"
    | ">="
    | "=="
    | "!="
    | "&"
    | "^"
    | "|"
    | "&&"
    | "^^"
    | "||";

function build_glsl_binary_operation(
    binary_operation: GlslBinaryOperation,
): string {
    return `(${build_glsl_expression(binary_operation.left)}${
        binary_operation.operation
    }${build_glsl_expression(binary_operation.right)})`;
}

export type GlslUnaryOperation = {
    operation: "+" | "-" | "!" | "~" | "pre++" | "pre--" | "post++" | "post--";
    operand: GlslExpression;
};

function build_glsl_unary_operation(
    unary_operation: GlslUnaryOperation,
): string {
    switch (unary_operation.operation) {
        case "pre++":
            return `++${build_glsl_expression(unary_operation.operand)}`;
        case "pre--":
            return `--${build_glsl_expression(unary_operation.operand)}`;
        case "post++":
            return `${build_glsl_expression(unary_operation.operand)}++`;
        case "post--":
            return `${build_glsl_expression(unary_operation.operand)}--`;
        default:
            return `${unary_operation.operation}${build_glsl_expression(
                unary_operation.operand,
            )}`;
    }
}

export type GlslIfdef<V extends 1 | 2> = {
    identifier: string;
    if: GlslStatement<V>[];
    else?: GlslStatement<V>[];
};

function build_glsl_ifdef<V extends 1 | 2>(ifdef: GlslIfdef<V>): string {
    return `#ifdef ${ifdef.identifier}\n${build_glsl_scope({
        statements: ifdef.if,
    })}\n#else\n${build_glsl_scope({
        statements: ifdef.else ?? [],
    })}\n#endif`;
}

function build_glsl_scope<V extends 1 | 2>(scope: GlslScope<V>): string {
    return `{\n${scope.statements.map(build_glsl_statement).join("\n")}\n}`;
}

const glsl1_reserved_unused = [
    "asm",
    "class",
    "union",
    "enum",
    "typedef",
    "template",
    "this",
    "packed",
    "goto",
    "switch",
    "default",
    "inline",
    "noinline",
    "volatile",
    "public",
    "static",
    "extern",
    "external",
    "interface",
    "flat",
    "long",
    "short",
    "double",
    "half",
    "fixed",
    "unsigned",
    "superp",
    "input",
    "output",
    "hvec2",
    "hvec3",
    "hvec4",
    "dvec2",
    "dvec3",
    "dvec4",
    "fvec2",
    "fvec3",
    "fvec4",
    "sampler1D",
    "sampler3D",
    "sampler1DShadow",
    "sampler2DShadow",
    "sampler2DRect",
    "sampler3DRect",
    "sampler2DRectShadow",
    "sizeof",
    "cast",
    "namespace",
    "using",
] as const;

const glsl1_reserved_used = [
    "attribute",
    "const",
    "uniform",
    "varying",
    "break",
    "continue",
    "do",
    "for",
    "while",
    "if",
    "else",
    "in",
    "out",
    "inout",
    "float",
    "int",
    "void",
    "bool",
    "true",
    "false",
    "lowp",
    "mediump",
    "highp",
    "precision",
    "invariant",
    "discard",
    "return",
    "mat2",
    "mat3",
    "mat4",
    "vec2",
    "vec3",
    "vec4",
    "ivec2",
    "ivec3",
    "ivec4",
    "bvec2",
    "bvec3",
    "bvec4",
    "sampler2D",
    "samplerCube",
    "struct",
] as const;

const glsl1_reserved = [...glsl1_reserved_unused, ...glsl1_reserved_used];

const glsl2_reserved_unused = [
    "attribute",
    "varying",
    "coherent",
    "volatile",
    "restrict",
    "readonly",
    "writeonly",
    "resource",
    "atomic_uint",
    "noperspective",
    "patch",
    "sample",
    "subroutine",
    "common",
    "partition",
    "active",
    "asm",
    "class",
    "union",
    "enum",
    "typedef",
    "template",
    "this",
    "goto",
    "inline",
    "noinline",
    "volatile",
    "public",
    "static",
    "extern",
    "external",
    "interface",
    "long",
    "short",
    "double",
    "half",
    "fixed",
    "unsigned",
    "superp",
    "input",
    "output",
    "hvec2",
    "hvec3",
    "hvec4",
    "dvec2",
    "dvec3",
    "dvec4",
    "fvec2",
    "fvec3",
    "fvec4",
    "sampler3DRect",
    "filter",
    "image1D",
    "image2D",
    "image3D",
    "imageCube",
    "iimage1D",
    "iimage2D",
    "iimage3D",
    "iimageCube",
    "uimage1D",
    "uimage2D",
    "uimage3D",
    "uimageCube",
    "image1DArray",
    "image2DArray",
    "iimage1DArray",
    "iimage2DArray",
    "uimage1DArray",
    "uimage2DArray",
    "imageBuffer",
    "iimageBuffer",
    "uimageBuffer",
    "sampler1D",
    "sampler1DShadow",
    "sampler1DArray",
    "sampler1DArrayShadow",
    "isampler1D",
    "isampler1DArray",
    "usampler1D",
    "usampler1DArray",
    "sampler2DRect",
    "sampler2DRectShadow",
    "isampler2DRect",
    "usampler2DRect",
    "samplerBuffer",
    "isamplerBuffer",
    "usamplerBuffer",
    "sampler2DMS",
    "isampler2DMS",
    "usampler2DMS",
    "sampler2DMSArray",
    "isampler2DMSArray",
    "usampler2DMSArray",
    "sizeof",
    "cast",
    "namespace",
    "using",
] as const;

const glsl2_reserved_used = [
    "const",
    "uniform",
    "layout",
    "centroid",
    "flat",
    "smooth",
    "break",
    "continue",
    "do",
    "for",
    "while",
    "switch",
    "case",
    "default",
    "if",
    "else",
    "in",
    "out",
    "inout",
    "float",
    "int",
    "void",
    "bool",
    "true",
    "false",
    "invariant",
    "discard",
    "return",
    "mat2",
    "mat3",
    "mat4",
    "mat2x2",
    "mat2x3",
    "mat2x4",
    "mat3x2",
    "mat3x3",
    "mat3x4",
    "mat4x2",
    "mat4x3",
    "mat4x4",
    "vec2",
    "vec3",
    "vec4",
    "ivec2",
    "ivec3",
    "ivec4",
    "bvec2",
    "bvec3",
    "bvec4",
    "uint",
    "uvec2",
    "uvec3",
    "uvec4",
    "lowp",
    "mediump",
    "highp",
    "precision",
    "sampler2D",
    "sampler3D",
    "samplerCube",
    "sampler2DShadow",
    "samplerCubeShadow",
    "sampler2DArray",
    "sampler2DArrayShadow",
    "isampler2D",
    "isampler3D",
    "isamplerCube",
    "isampler2DArray",
    "18",
    "3",
    "Basics",
    "usampler2D",
    "usampler3D",
    "usamplerCube",
    "usampler2DArray",
    "struct",
] as const;

const glsl2_reserved = [
    ...glsl2_reserved_unused,
    ...glsl2_reserved_used,
] as const;
const glsl_reserved = [...glsl1_reserved, ...glsl2_reserved] as const;

export type GlslReserved = (typeof glsl_reserved)[number];

export function build_glsl_identifier(identifier: string): string {
    function cast_char_to_valid_char(char: string): string {
        if (char.match(/[a-zA-Z0-9_]/)) {
            return char;
        }
        return `${char.charCodeAt(0).toString(16).toUpperCase()}`;
    }

    const new_string = identifier
        .split("")
        .map(cast_char_to_valid_char)
        .join("");
    if (glsl_reserved.includes(new_string as GlslReserved)) {
        return `_${new_string}`;
    }

    if (new_string.startsWith("gl_")) {
        return `_${new_string}`;
    }

    if (new_string?.[0]?.match(/[0-9]/)) {
        return `_${new_string}`;
    }

    return new_string;
}

function build_glsl_struct(
    struct: GlslStructType<1 | 2, GlslFullType<1 | 2>>,
): string {
    return `struct ${build_glsl_identifier(struct.name)} {\n${struct.members
        .map((member) => {
            return `${build_glsl_type(member.type)} ${build_glsl_identifier(
                member.name,
            )};`;
        })
        .join("\n")}\n};`;
}

export type GlslStructMember<V extends 1 | 2, T extends GlslFullType<V>> = {
    name: string;
    type: T;
};

export type GlslStructType<V extends 1 | 2, T extends GlslFullType<V>> = {
    name: string;
    members: GlslStructMember<V, T>[];
    type: "struct";
};

type GlslFullStructMember<V extends 1 | 2> = {
    name: string;
    type: GlslFullType<V>;
};

type GlslFullStructType<V extends 1 | 2> = {
    name: string;
    members: GlslFullStructMember<V>[];
    type: "struct";
};

type GlslFullInnerArrayType<V extends 1 | 2> =
    | GlslIntegralType<V>
    | GlslFloatingPointType<V>
    | GlslBooleanType
    | GlslOpaqueType<V>
    | GlslStructType<V, GlslFullType<V>>;

export type GlslArrayType<
    V extends 1 | 2,
    T extends GlslFullInnerArrayType<V>,
> = {
    type: "array";
    inner_type: T;
    size: number;
};

type GlslFullArrayType<V extends 1 | 2> = {
    type: "array";
    inner_type: GlslFullInnerArrayType<V>;
    size: number;
};

function build_glsl_type(
    value: GlslFullType<1 | 2> | { type: "void" },
): string {
    if (value.type === "struct") {
        return value.name;
    }
    if ("precision" in value && value.precision !== "default") {
        return `${value.precision} ${value.type}`;
    }
    return value.type;
}

export type GlslScope<V extends 1 | 2> = {
    statements: GlslStatement<V>[];
};

export type GlslIntegralType<V extends 1 | 2> =
    | GlslScalarIntegralType<V>
    | GlslVectorIntegralType<V>;

export type GlslScalarIntegralType<V extends 1 | 2> = {
    type: "int" | (V extends 2 ? "uint" : never);
};

export type GlslVectorIntegralType<V extends 1 | 2> = {
    type:
        | "ivec2"
        | "ivec3"
        | "ivec4"
        | (V extends 2 ? "uvec2" | "uvec3" | "uvec4" : never);
};

export type GlslBasicFloatingPointType = {
    type: "float" | "vec2" | "vec3" | "vec4";
    precision: "lowp" | "mediump" | "highp" | "default";
};

export type GlslFloatingPointType<V extends 1 | 2> =
    | {
          type:
              | "mat2"
              | "mat3"
              | "mat4"
              | (V extends 2
                    ?
                          | "mat2x2"
                          | "mat2x3"
                          | "mat2x4"
                          | "mat3x2"
                          | "mat3x3"
                          | "mat3x4"
                          | "mat4x2"
                          | "mat4x3"
                          | "mat4x4"
                    : never);
          precision: "lowp" | "mediump" | "highp" | "default";
      }
    | GlslBasicFloatingPointType;

export type GlslBooleanType = {
    type: "bool" | "bvec2" | "bvec3" | "bvec4";
};

export type GlslOpaqueType<V extends 1 | 2> = {
    type:
        | "sampler2D"
        | "samplerCube"
        | (V extends 2
              ?
                    | "sampler3D"
                    | "samplerCubeShadow"
                    | "sampler2DShadow"
                    | "sampler2DArray"
                    | "sampler2DArrayShadow"
                    // integers
                    | "isampler2D"
                    | "isampler3D"
                    | "isamplerCube"
                    | "isampler2DArray"
                    // unsigned integers
                    | "usampler2D"
                    | "usampler3D"
                    | "usamplerCube"
                    | "usampler2DArray"
              : never);
};

export type GlslFullType<V extends 1 | 2> =
    | GlslIntegralType<V>
    | GlslFloatingPointType<V>
    | GlslBooleanType
    | GlslOpaqueType<V>
    | GlslFullStructType<V> // These full types are seperate and not generic as typescript does not support cyclic generics
    | GlslFullArrayType<V>;

export type Glsl1AttributeDeclaration<N extends string> = {
    variable_type: GlslFloatingPointType<1>;
    name: N;
    invariant?: boolean;
};

export type Glsl1VaryingDeclaration<N extends string> = {
    variable_type: GlslFloatingPointType<1>;
    name: N;
    invariant?: boolean;
};

export type GlslUniformDeclaration<V extends 1 | 2, N extends string> = {
    variable_type: V extends 1 ? GlslFloatingPointType<1> : GlslFullType<2>;
    name: N;
    invariant?: boolean;
};

type GlslInOutType =
    | GlslIntegralType<2>
    | GlslFloatingPointType<2>
    | GlslArrayType<2, GlslIntegralType<2> | GlslFloatingPointType<2>>
    | GlslStructType<2, GlslIntegralType<2> | GlslFloatingPointType<2>>;

export type Glsl2InDeclaration<N extends string, K extends GlslShaderKind> = {
    variable_type: K extends "vertex"
        ? GlslIntegralType<2> | GlslFloatingPointType<2>
        : GlslInOutType;
    name: N;
    centroid?: boolean;
    invariant?: boolean;
    interpolation?: "smooth" | "flat";
};

export type Glsl2OutDeclaration<N extends string, K extends GlslShaderKind> =
    | {
          variable_type: K extends "vertex"
              ? GlslInOutType
              :
                    | GlslIntegralType<2>
                    | GlslBasicFloatingPointType // matrix are not allowed
                    | GlslArrayType<
                          2,
                          GlslIntegralType<2> | GlslBasicFloatingPointType
                      >;
          name: N;
          invariant?: boolean;
          interpolation?: "smooth" | "flat";
      }
    | (K extends "vertex"
          ? {
                centroid?: boolean;
            }
          : {});

export type GlslVariableDeclaration<
    V extends 1 | 2,
    N extends string,
    K extends GlslShaderKind,
> = (
    | {
          qualifier?: "const";
          variable_type: GlslFullType<V>;
          initializer: GlslExpression;
      }
    | (GlslUniformDeclaration<V, N> & {
          qualifier: "uniform";
      })
    | (V extends 1
          ?
                | (Glsl1AttributeDeclaration<N> & {
                      qualifier: "attribute";
                  })
                | (Glsl1VaryingDeclaration<N> & {
                      qualifier: "varying";
                  })
          :
                | (Glsl2InDeclaration<N, K> & {
                      qualifier: "in";
                  })
                | (Glsl2OutDeclaration<N, K> & {
                      qualifier: "out";
                  }))
) & {
    name: N;
    invariant?: boolean;
};

export type GlslRequiredVariableDeclaration<
    V extends 1 | 2,
    N extends string,
> = {
    qualifier?:
        | "const"
        | "uniform"
        | (V extends 1 ? "attribute" | "varying" : "in" | "out");
    variable_type: GlslFullType<V>;
    name: N;
    invariant?: boolean;
    initializer?: GlslExpression;
} & (V extends 2
    ? { centroid?: boolean; interpolation?: "smooth" | "flat" }
    : {});

function build_glsl_variable_declaration(
    declaration: GlslVariableDeclaration<1 | 2, string, GlslShaderKind>,
): string {
    const core = (() => {
        if (declaration.variable_type.type === "array") {
            return `${build_glsl_type(
                declaration.variable_type.inner_type,
            )} ${build_glsl_identifier(declaration.name)}[${
                declaration.variable_type.size
            }]`;
        } else {
            return `${build_glsl_type(
                declaration.variable_type,
            )} ${build_glsl_identifier(declaration.name)}`;
        }
    })();
    return `${declaration.invariant ? "invariant " : ""}${
        declaration.qualifier ?? ""
    } ${core}${
        declaration.qualifier === "const" || !declaration.qualifier
            ? ` = ${build_glsl_expression(declaration.initializer)}`
            : ""
    };`;
}

export type GlslVariableAssign =
    | {
          name: string;
          operator: "=" | "+=" | "-=" | "*=" | "/=" | "%=";
          value: GlslExpression;
      }
    | {
          name: string;
          operator: "++" | "--";
      };

function build_glsl_variable_assign(assignment: GlslVariableAssign): string {
    if ("value" in assignment) {
        return `${assignment.name} ${
            assignment.operator
        } ${build_glsl_expression(assignment.value)};`;
    } else {
        return `${assignment.name}${assignment.operator};`;
    }
}

export type GlslFunctionDeclaration<V extends 1 | 2> = {
    name: string;
    parameters: GlslFunctionParameter<V>[];
    return_type: GlslFullType<V> | { type: "void" };
    body: GlslStatement<V>[];
};

export type GlslFunctionParameter<V extends 1 | 2> = {
    name: string;
    type: GlslFullType<V>;
};

function build_glsl_function_parameter<V extends 1 | 2>(
    parameter: GlslFunctionParameter<V>,
): string {
    return `${build_glsl_type(parameter.type)} ${parameter.name}`;
}

function build_glsl1_function_declaration<V extends 1 | 2>(
    declaration: GlslFunctionDeclaration<V>,
): string {
    return `${build_glsl_type(declaration.return_type)} ${
        declaration.name
    }(${declaration.parameters
        .map(build_glsl_function_parameter)
        .join(", ")})${build_glsl_scope({ statements: declaration.body })}`;
}

export type GlslIf<V extends 1 | 2> = {
    condition: GlslExpression;
    if: GlslStatement<V>[];
    else?: GlslStatement<V>[];
};

function build_glsl_if<V extends 1 | 2>(if_statement: GlslIf<V>): string {
    return `if (${build_glsl_expression(
        if_statement.condition,
    )}) ${build_glsl_scope({ statements: if_statement.if })} ${
        if_statement.else
            ? `else ${build_glsl_scope({ statements: if_statement.else })}`
            : ""
    }`;
}

export type GlslFor<V extends 1 | 2> = {
    initializer: {
        variable_type: GlslFullType<V>;
        name: string;
        initializer: GlslExpression;
    };
    condition: GlslExpression;
    increment: GlslVariableAssign;
    body: GlslStatement<V>[];
};

function build_glsl_for<V extends 1 | 2>(for_statement: GlslFor<V>): string {
    return `for (${build_glsl_variable_declaration({
        ...for_statement.initializer,
        invariant: false,
    })}; ${build_glsl_expression(
        for_statement.condition,
    )}; ${build_glsl_variable_assign(
        for_statement.increment,
    )}) ${build_glsl_scope({ statements: for_statement.body })}`;
}

export type GlslWhile<V extends 1 | 2> = {
    condition: GlslExpression;
    body: GlslStatement<V>[];
    do_while: boolean;
};

function build_glsl_while<V extends 1 | 2>(
    while_statement: GlslWhile<V>,
): string {
    if (while_statement.do_while) {
        return `do ${build_glsl_scope({
            statements: while_statement.body,
        })} while (${build_glsl_expression(while_statement.condition)});`;
    } else {
        return `while (${build_glsl_expression(
            while_statement.condition,
        )}) ${build_glsl_scope({ statements: while_statement.body })}`;
    }
}

export type GlslPrecisionDeclaration<V extends 1 | 2> = {
    precision: "highp" | "mediump" | "lowp";
    precision_type?: GlslFloatType<V>["type"];
};

function build_glsl_precision_declaration<V extends 1 | 2>(
    declaration: GlslPrecisionDeclaration<V>,
): string {
    return `precision ${declaration.precision} ${
        declaration.precision_type ?? ""
    };`;
}

export const glsl_supports_highp = "GL_FRAGMENT_PRECISION_HIGH";

export type Glsl1InvariantDeclaration = {
    invariant: boolean;
    variable: string;
};

function build_glsl1_invariant_declaration(
    declaration: Glsl1InvariantDeclaration,
): string {
    return `invariant ${declaration.variable};`;
}

export type Glsl1Control =
    | {
          control_type: "return";
          value?: GlslExpression;
      }
    | {
          control_type: "break";
      }
    | {
          control_type: "continue";
      }
    | {
          control_type: "discard";
      };

function build_glsl1_control(control: Glsl1Control): string {
    switch (control.control_type) {
        case "return":
            return control.value ? build_glsl_expression(control.value) : "";
        case "break":
            return "break";
        case "continue":
            return "continue";
        case "discard":
            return "discard";
    }
}

export type GlslStatement<V extends 1 | 2, K extends GlslShaderKind> =
    | ({
          type: "variable_declaration";
      } & GlslVariableDeclaration<V, string, K>)
    | ({
          type: "variable_assign";
      } & GlslVariableAssign)
    | ({
          type: "function_declaration";
      } & GlslFunctionDeclaration<V>)
    | ({
          type: "precision_declaration";
      } & GlslPrecisionDeclaration<V>)
    | ({
          type: "invariant_declaration";
      } & Glsl1InvariantDeclaration)
    | ({
          type: "scope";
      } & GlslScope<V>)
    | ({
          type: "ifdef";
      } & GlslIfdef<V>)
    | ({
          type: "struct";
      } & GlslStructType<V, GlslFullType<V>>)
    | ({
          type: "control";
      } & Glsl1Control)
    | ({
          type: "if";
      } & GlslIf<V>)
    | ({
          type: "for";
      } & GlslFor<V>)
    | ({
          type: "while";
      } & GlslWhile<V>);

function build_glsl_statement(
    statement: GlslStatement<1 | 2, GlslShaderKind>,
): string {
    switch (statement.type) {
        case "variable_declaration":
            return build_glsl_variable_declaration(statement);
        case "variable_assign":
            return build_glsl_variable_assign(statement);
        case "function_declaration":
            return build_glsl1_function_declaration(statement);
        case "precision_declaration":
            return build_glsl_precision_declaration(statement);
        case "invariant_declaration":
            return build_glsl1_invariant_declaration(statement);
        case "scope":
            return build_glsl_scope(statement);
        case "ifdef":
            return build_glsl_ifdef(statement);
        case "struct":
            return build_glsl_struct(statement);
        case "control":
            return `return ${build_glsl1_control(statement)};`;
        case "if":
            return build_glsl_if(statement);
        case "for":
            return build_glsl_for(statement);
        case "while":
            return build_glsl_while(statement);
    }
}

export type GlslShader<V extends 1 | 2> = {
    version: V;
    statements: GlslStatement<V>[];
};

export function build_glsl_shader<V extends 1 | 2>(
    shader: GlslShader<V>,
): string {
    const version_string =
        shader.version === 1 ? "#version 100" : "#version 300 es";
    return `${version_string}\n\n${shader.statements
        .map(build_glsl_statement)
        .join("\n")}`;
}

export type GlslTypeName<V extends 1 | 2> = GlslFullType<V>["type"];
