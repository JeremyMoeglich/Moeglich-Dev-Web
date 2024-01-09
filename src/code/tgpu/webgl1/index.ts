import { panic } from "functional-utilities";
import {
    type GlslShader,
    build_glsl_shader,
    GlslFullType,
    GlslFloatType,
    GlslUniformDeclaration,
    GlslAttributeDeclaration,
    GlslVaryingDeclaration,
    GlslVariableDeclaration,
} from "../glsl1";
import { GlslShaderFunction, create_glsl_shader } from "../glsl1/function";
import { MapGlslToBuilder } from "../glsl1/builder/to_builder";
import { MapGlslToLiteral } from "../glsl1/type_mapping";

export function init_shader_program(
    gl: WebGLRenderingContext,
    vertex: GlslShader,
    fragment: GlslShader,
): WebGLProgram {
    const program = gl.createProgram() ?? panic("Failed to create program");
    gl.attachShader(program, load_shader(gl, gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, load_shader(gl, gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert(
            "Unable to initialize the shader program: " +
                gl.getProgramInfoLog(program),
        );
        throw new Error("Shader program initialization failed");
    }

    return program;
}

// Creates a shader of the given type, uploads the source and compiles it.
function load_shader(
    gl: WebGLRenderingContext,
    type: number,
    source: GlslShader,
): WebGLShader {
    const shader: WebGLShader = gl.createShader(type)!;
    gl.shaderSource(shader, build_glsl_shader(source));
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            "An error occurred compiling the shaders: " +
                gl.getShaderInfoLog(shader),
        );
        gl.deleteShader(shader);
        throw new Error("Failed to compile shader");
    }

    return shader;
}

type DeclarationsByName<
    N extends string,
    T extends GlslVariableDeclaration<N>[],
> = {
    [K in T[number]["name"]]: Extract<T[number], { name: K }>;
};

type ExtractLiterals<
    N extends string,
    U extends GlslVariableDeclaration<N>[],
> = {
    [K in keyof DeclarationsByName<N, U>]: K extends keyof DeclarationsByName<
        N,
        U
    >
        ? MapGlslToLiteral<DeclarationsByName<N, U>[K]["variable_type"]>
        : never;
};

export class ShaderInstance<
    U extends GlslUniformDeclaration<N>[],
    A extends GlslAttributeDeclaration<N>[],
    V extends GlslVaryingDeclaration<N>[],
    N extends string,
> {
    program: WebGLProgram;
    uniform_locations: Map<string, WebGLUniformLocation>;
    attribute_locations: Map<string, number>;
    gl: WebGLRenderingContext;

    constructor(
        globals: {
            uniform: [...U];
            attribute: [...A];
            varying: [...V];
        },
        vertex_func: GlslShaderFunction<U, A, V, "vertex", N>,
        fragment_func: GlslShaderFunction<U, A, V, "fragment", N>,
        gl: WebGLRenderingContext,
    ) {
        const { uniform, attribute, varying } = globals;
        const vertex = create_glsl_shader(
            uniform,
            attribute,
            varying,
            "vertex",
            vertex_func,
        );

        const fragment = create_glsl_shader(
            uniform,
            attribute,
            varying,
            "fragment",
            fragment_func,
        );

        this.program = init_shader_program(gl, vertex, fragment);
        this.uniform_locations = new Map();
        for (const u of uniform) {
            this.uniform_locations.set(
                u.name,
                gl.getUniformLocation(this.program, u.name)!,
            );
        }
        this.attribute_locations = new Map();
        for (const a of attribute) {
            this.attribute_locations.set(
                a.name,
                gl.getAttribLocation(this.program, a.name)!,
            );
        }
        this.gl = gl;
    }

    run(
        uniforms: ExtractLiterals<N, U>,
        attributes: {
            [K in keyof ExtractLiterals<N, A>]: ExtractLiterals<N, A>[K][];
        },
    ) {
        this.gl.useProgram(this.program);
        for (const [name, uniform] of this.uniform_locations) {
            const value =
                (
                    uniforms as unknown as Record<
                        string,
                        GlslUniformDeclaration<string>
                    >
                )[name] ?? panic(`Missing uniform ${name}`);
            if (typeof value === "number") {
                this.gl.uniform1f(uniform, value);
            } else if (typeof value === "boolean") {
                this.gl.uniform1i(uniform, value ? 1 : 0);
            } else if (Array.isArray(value)) {
                if (value.length === 2) {
                    this.gl.uniform2fv(uniform, value);
                } else if (value.length === 3) {
                    this.gl.uniform3fv(uniform, value);
                } else if (value.length === 4) {
                    this.gl.uniform4fv(uniform, value);
                } else {
                    throw new Error("Invalid uniform array length");
                }
            } else {
                throw new Error("Invalid uniform type");
            }
        }

        for (const [name, attribute] of this.attribute_locations) {
            const value =
                (
                    attributes as unknown as Record<
                        string,
                        GlslAttributeDeclaration<string>
                    >
                )[name] ?? panic(`Missing attribute ${name}`);
            if (typeof value === "number") {
                this.gl.vertexAttrib1f(attribute, value);
            } else if (typeof value === "boolean") {
                this.gl.vertexAttrib1i(attribute, value ? 1 : 0);
            } else if (Array.isArray(value)) {
                if (value.length === 2) {
                    this.gl.vertexAttrib2fv(attribute, value);
                } else if (value.length === 3) {
                    this.gl.vertexAttrib3fv(attribute, value);
                } else if (value.length === 4) {
                    this.gl.vertexAttrib4fv(attribute, value);
                } else {
                    throw new Error("Invalid attribute array length");
                }
            } else {
                throw new Error("Invalid attribute type");
            }
        }

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}
