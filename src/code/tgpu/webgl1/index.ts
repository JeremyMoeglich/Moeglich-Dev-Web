import { panic } from "functional-utilities";
import {
    type GlslShader,
    build_glsl_shader,
    GlslFloatType,
    GlslUniformDeclaration,
    GlslAttributeDeclaration,
    GlslVaryingDeclaration,
    GlslRequiredVariableDeclaration,
    GlslFullType,
    build_glsl_identifier,
} from "../glsl1";
import { GlslShaderFunction, create_glsl_shader } from "../glsl1/function";
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

export type ExtractLiterals<
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
    uniform_locations: Map<
        string,
        {
            loc: WebGLUniformLocation;
            type: GlslFullType;
        }
    >;
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

        console.log(build_glsl_shader(vertex));
        console.log(build_glsl_shader(fragment));
        this.program = init_shader_program(gl, vertex, fragment);
        this.uniform_locations = new Map();
        for (const u of uniform) {
            this.uniform_locations.set(u.name, {
                loc: gl.getUniformLocation(
                    this.program,
                    build_glsl_identifier(u.name),
                )!,
                type: u.variable_type,
            });
        }
        this.attribute_locations = new Map();
        for (const a of attribute) {
            console.log(build_glsl_identifier(a.name));
            this.attribute_locations.set(a.name, {
                loc: gl.getAttribLocation(
                    this.program,
                    build_glsl_identifier(a.name),
                ),
                type: a.variable_type,
            });
        }
        this.gl = gl;
        console.log(this.uniform_locations);
        console.log(this.attribute_locations);
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
            const buffer = this.gl.createBuffer()!;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.bufferData(
                this.gl.ARRAY_BUFFER,
                new Float32Array(attribute.flat()),
                this.gl.STATIC_DRAW,
            );
            this.gl.enableVertexAttribArray(loc);
            this.gl.vertexAttribPointer(
                loc,
                type_to_float_amount(type),
                this.gl.FLOAT,
                false,
                0,
                0,
            );
        }

        for (const [name, value] of Object.entries(
            uniforms as Record<string, number[]>,
        )) {
            const { loc, type } = this.uniform_locations.get(name)!;
            switch (type.type) {
                case "float":
                    this.gl.uniform1f(loc, value as unknown as number);
                    break;
                case "vec2":
                    this.gl.uniform2fv(loc, value);
                    break;
                case "vec3":
                    this.gl.uniform3fv(loc, value);
                    break;
                case "vec4":
                    this.gl.uniform4fv(loc, value);
                    break;
                case "mat2":
                    this.gl.uniformMatrix2fv(loc, false, value);
                    break;
                case "mat3":
                    this.gl.uniformMatrix3fv(loc, false, value);
                    break;
                case "mat4":
                    this.gl.uniformMatrix4fv(loc, false, value);
                    break;
                default:
                    throw new Error(`Unsupported uniform type: ${type.type}`);
            }
        }

        const sample_attribute = (Object.values(attributes)[0] ??
            panic("No attributes")) as (number | number[])[];

        this.gl.drawArrays(this.gl.TRIANGLES, 0, sample_attribute.length);
    }
}

function type_to_float_amount(type: GlslFloatType): number {
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
