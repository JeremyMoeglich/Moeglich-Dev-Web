export type Glsl2Shader = {
    version: 2;
    statements: Glsl2Statement[];
};

export function build_glsl2_shader(shader: Glsl2Shader): string {
    return `#version 300 es;\n\n${shader.statements
        .map(build_glsl2_statement)
        .join("\n")}`;
}

export function build_glsl2_define(define: Glsl2Define): string {
    return `#define ${define.name} ${define.value}`;
}

export function build_glsl2_use_define(define: Glsl2UseDefine): string {
    return define.name;
}

export type Glsl2FunctionDeclaration = {