// https://registry.khronos.org/OpenGL/specs/es/2.0/GLSL_ES_Specification_1.00.pdf

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

export type GlslIfdef = {
    identifier: string;
    if: GlslStatement[];
    else?: GlslStatement[];
};

function build_glsl_ifdef(ifdef: GlslIfdef): string {
    return `#ifdef ${ifdef.identifier}\n${build_glsl_scope({
        statements: ifdef.if,
    })}\n#else\n${build_glsl_scope({
        statements: ifdef.else ?? [],
    })}\n#endif`;
}

function build_glsl_scope(scope: GlslScope): string {
    return `{\n${scope.statements.map(build_glsl_statement).join("\n")}\n}`;
}

const glsl_reserved_unused = [
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

const glsl_reserved_used = [
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

const glsl_reserved = [...glsl_reserved_unused, ...glsl_reserved_used];

export type GlslReserved = (typeof glsl_reserved)[number];

export function build_glsl_identifier(identifier: string): string {
    function cast_char_to_valid_char(char: string): string {
        if (char.match(/[a-zA-Z0-9]/)) {
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

    return new_string;
}

export type GlslStruct = {
    name: string;
    members: GlslStructMember[];
};

function build_glsl_struct(struct: GlslStruct): string {
    return `struct ${build_glsl_identifier(struct.name)} {\n${struct.members
        .map((member) => {
            return `${build_glsl_type(member.type)} ${build_glsl_identifier(
                member.name,
            )};`;
        })
        .join("\n")}\n};`;
}

export type GlslStructMember = {
    name: string;
    type: GlslType;
};

export type GlslStructIdentifier = {
    name: string;
};

export type GlslArray = {
    inner_type: GlslType;
    size: number;
};

export type GlslFloatType = {
    type: "float" | "vec2" | "vec3" | "vec4" | "mat2" | "mat3" | "mat4";
    precision: "highp" | "mediump" | "lowp" | "default";
};

export type GlslType =
    | {
          type:
              | "void"
              | "bool"
              | "int"
              | "bvec2"
              | "bvec3"
              | "bvec4"
              | "ivec2"
              | "ivec3"
              | "ivec4"
              | "sampler2D"
              | "samplerCube";
      }
    | (GlslStructIdentifier & { type: "struct" })
    | GlslFloatType;

function build_glsl_type(type: GlslType): string {
    if (type.type === "struct") {
        return type.name;
    }
    if ("precision" in type && type.precision !== "default") {
        return `${type.precision} ${type.type}`;
    }
    return type.type;
}

export type GlslScope = {
    statements: GlslStatement[];
};

export type GlslFullType = GlslType | ({ type: "array" } & GlslArray);

export type GlslAttributeDeclaration<N extends string> = {
    variable_type: GlslFloatType;
    name: N;
    invariant?: boolean;
};

export type GlslVaryingDeclaration<N extends string> = {
    variable_type: GlslFloatType;
    name: N;
    invariant?: boolean;
};

export type GlslUniformDeclaration<N extends string> = {
    variable_type: GlslFullType;
    name: N;
    invariant?: boolean;
};

export type GlslVariableDeclaration<N extends string> = (
    | {
          qualifier?: "const";
          variable_type: GlslFullType;
          initializer: GlslExpression;
      }
    | (GlslAttributeDeclaration<N> & {
          qualifier: "attribute";
      })
    | (GlslVaryingDeclaration<N> & {
          qualifier: "varying";
      })
    | (GlslUniformDeclaration<N> & {
          qualifier: "uniform";
      })
) & {
    name: N;
    invariant?: boolean;
};

export type GlslRequiredVariableDeclaration<N extends string> = {
    qualifier?: "const" | "attribute" | "varying" | "uniform";
    variable_type: GlslFullType;
    name: N;
    invariant?: boolean;
    initializer?: GlslExpression;
};

function build_glsl_variable_declaration(
    declaration: GlslVariableDeclaration<string>,
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

export type GlslFunctionDeclaration = {
    name: string;
    parameters: GlslFunctionParameter[];
    return_type: GlslType;
    body: GlslStatement[];
};

export type GlslFunctionParameter = {
    name: string;
    type: GlslType;
};

function build_glsl_function_parameter(
    parameter: GlslFunctionParameter,
): string {
    return `${build_glsl_type(parameter.type)} ${parameter.name}`;
}

function build_glsl_function_declaration(
    declaration: GlslFunctionDeclaration,
): string {
    return `${build_glsl_type(declaration.return_type)} ${
        declaration.name
    }(${declaration.parameters
        .map(build_glsl_function_parameter)
        .join(", ")})${build_glsl_scope({ statements: declaration.body })}`;
}

export type GlslIf = {
    condition: GlslExpression;
    if: GlslStatement[];
    else?: GlslStatement[];
};

function build_glsl_if(if_statement: GlslIf): string {
    return `if (${build_glsl_expression(
        if_statement.condition,
    )}) ${build_glsl_scope({ statements: if_statement.if })} ${
        if_statement.else
            ? `else ${build_glsl_scope({ statements: if_statement.else })}`
            : ""
    }`;
}

export type GlslFor = {
    initializer: {
        variable_type: GlslType;
        name: string;
        initializer: GlslExpression;
    };
    condition: GlslExpression;
    increment: GlslVariableAssign;
    body: GlslStatement[];
};

function build_glsl_for(for_statement: GlslFor): string {
    return `for (${build_glsl_variable_declaration({
        ...for_statement.initializer,
        invariant: false,
    })}; ${build_glsl_expression(
        for_statement.condition,
    )}; ${build_glsl_variable_assign(
        for_statement.increment,
    )}) ${build_glsl_scope({ statements: for_statement.body })}`;
}

export type GlslWhile = {
    condition: GlslExpression;
    body: GlslStatement[];
    do_while: boolean;
};

function build_glsl_while(while_statement: GlslWhile): string {
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

export type GlslPrecisionDeclaration = {
    precision: "highp" | "mediump" | "lowp";
    precision_type?: GlslType["type"];
};

function build_glsl_precision_declaration(
    declaration: GlslPrecisionDeclaration,
): string {
    return `precision ${declaration.precision} ${
        declaration.precision_type ?? ""
    };`;
}

export const glsl_supports_highp = "GL_FRAGMENT_PRECISION_HIGH";

export type GlslInvariantDeclaration = {
    invariant: boolean;
    variable: string;
};

function build_glsl_invariant_declaration(
    declaration: GlslInvariantDeclaration,
): string {
    return `invariant ${declaration.variable};`;
}

export type GlslControl =
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

function build_glsl_control(control: GlslControl): string {
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

export type GlslStatement =
    | ({
          type: "variable_declaration";
      } & GlslVariableDeclaration<string>)
    | ({
          type: "variable_assign";
      } & GlslVariableAssign)
    | ({
          type: "function_declaration";
      } & GlslFunctionDeclaration)
    | ({
          type: "precision_declaration";
      } & GlslPrecisionDeclaration)
    | ({
          type: "invariant_declaration";
      } & GlslInvariantDeclaration)
    | ({
          type: "scope";
      } & GlslScope)
    | ({
          type: "ifdef";
      } & GlslIfdef)
    | ({
          type: "struct";
      } & GlslStruct)
    | ({
          type: "control";
      } & GlslControl)
    | ({
          type: "if";
      } & GlslIf)
    | ({
          type: "for";
      } & GlslFor)
    | ({
          type: "while";
      } & GlslWhile);

function build_glsl_statement(statement: GlslStatement): string {
    switch (statement.type) {
        case "variable_declaration":
            return build_glsl_variable_declaration(statement);
        case "variable_assign":
            return build_glsl_variable_assign(statement);
        case "function_declaration":
            return build_glsl_function_declaration(statement);
        case "precision_declaration":
            return build_glsl_precision_declaration(statement);
        case "invariant_declaration":
            return build_glsl_invariant_declaration(statement);
        case "scope":
            return build_glsl_scope(statement);
        case "ifdef":
            return build_glsl_ifdef(statement);
        case "struct":
            return build_glsl_struct(statement);
        case "control":
            return `return ${build_glsl_control(statement)};`;
        case "if":
            return build_glsl_if(statement);
        case "for":
            return build_glsl_for(statement);
        case "while":
            return build_glsl_while(statement);
    }
}


export type GlslShader = {
    version: "100";
    statements: GlslStatement[];
};

export function build_glsl_shader(shader: GlslShader): string {
    return `#version 100;\n\n${shader.statements
        .map(build_glsl_statement)
        .join("\n")}`;
}

export type GlslTypeName = GlslFullType["type"];
