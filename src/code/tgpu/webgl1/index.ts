import { panic } from "functional-utilities";
import { type GlslShader, build_glsl_shader } from "../glsl1";

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
