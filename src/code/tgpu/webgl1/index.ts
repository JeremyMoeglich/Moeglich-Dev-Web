import { panic, typed_entries } from "functional-utilities";
import {
    type GlslShader,
    build_glsl_shader,
    GlslFullType,
    GlslFloatType,
    GlslUniformDeclaration,
    GlslAttributeDeclaration,
    GlslVaryingDeclaration,
    GlslVariableDeclaration,
    GlslRequiredVariableDeclaration,
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
    T extends GlslRequiredVariableDeclaration<N>[],
> = {
    [K in T[number]["name"]]: Extract<T[number], { name: K }>;
};

type ExtractLiterals<
    N extends string,
    U extends GlslRequiredVariableDeclaration<N>[],
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
    attribute_locations: Map<
        string,
        {
            loc: number;
            type: GlslFloatType;
        }
    >;
    gl: WebGLRenderingContext;

    constructor(
        globals: {
            uniform: [...U];
            attribute: [...A];
            varying: [...V];
        },
        vertex_func: GlslShaderFunction<U, A, V, "vertex", N>,
        fragment_func: GlslShaderFunction<U, [], V, "fragment", N>,
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
            [],
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
            this.attribute_locations.set(a.name, {
                loc: gl.getAttribLocation(this.program, a.name)!,
                type: a.variable_type,
            });
        }
        this.gl = gl;
    }

    run(
        uniforms: ExtractLiterals<N, U>,
        attributes: {
            [K in keyof ExtractLiterals<N, A>]: ExtractLiterals<N, A>[K][];
        },
    ) {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        this.gl.clearDepth(1.0); // Clear everything
        this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
        this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.program);

        for (const [name, attribute] of Object.entries(
            attributes as Record<string, number[][] | number[]>,
        )) {
            const { loc, type } = this.attribute_locations.get(name)!;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, loc);
            this.gl.bufferData(
                this.gl.ARRAY_BUFFER,
                new Float32Array(attribute.flat()),
                this.gl.STATIC_DRAW,
            );
            this.gl.enableVertexAttribArray(loc);
            this.gl.vertexAttribPointer(loc, 2, to_gl_type(type), false, 0, 0);
        }

        const sample_attribute =
            Object.values(attributes)[0] ?? panic("No attributes");

        this.gl.drawArrays(
            this.gl.TRIANGLES,
            0,
            (sample_attribute as any[]).length,
        );
    }
}

function to_gl_type(type: GlslFloatType): number {
    switch (type.type) {
        case "float":
            return WebGLRenderingContext.FLOAT;
        case "vec2":
            return WebGLRenderingContext.FLOAT_VEC2;
        case "vec3":
            return WebGLRenderingContext.FLOAT_VEC3;
        case "vec4":
            return WebGLRenderingContext.FLOAT_VEC4;
        case "mat2":
            return WebGLRenderingContext.FLOAT_MAT2;
        case "mat3":
            return WebGLRenderingContext.FLOAT_MAT3;
        case "mat4":
            return WebGLRenderingContext.FLOAT_MAT4;
    }
}

function values_per_vertex(type: GlslFloatType): number {
    switch (type.type) {
        case "float":
            return 1;
        case "vec2":
            return 2;
        case "vec3":
            return 3;
        case "vec4":
            return 4;
        case "mat2":
            return 4;
        case "mat3":
            return 9;
        case "mat4":
            return 16;
    }
}
