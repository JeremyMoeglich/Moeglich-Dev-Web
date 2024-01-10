import { maybe_global } from "functional-utilities";
import { ExtractLiterals, ShaderInstance } from ".";
import { GlslUniformDeclaration } from "../glsl1";
import { GlslBoolean } from "../glsl1/builder/glsl_boolean";
import { GlslVariable } from "../glsl1/builder/glsl_var";
import { GlslVec2 } from "../glsl1/builder/glsl_vec2";
import { GlslVec4 } from "../glsl1/builder/glsl_vec4";
import { BuildScope } from "../glsl1/builder/scope";
import { GlslBuilder, MapGlslToBuilder } from "../glsl1/builder/to_builder";

let sharedWebGLContext: WebGLRenderingContext | null = null;

function getSharedWebGLContext() {
    if (!sharedWebGLContext) {
        // Create an invisible canvas element
        const canvas = maybe_global("document")?.createElement("canvas");
        if (!canvas) {
            return null;
        }

        // Append the canvas to the body to make it part of the DOM
        // It's invisible, so it won't affect your page layout
        document.body.appendChild(canvas);

        // for debug show the canvas statically in the top right
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.right = "0";
        canvas.style.width = "100px";
        canvas.style.height = "100px";

        // Try to get a WebGL context
        sharedWebGLContext =
            canvas.getContext("webgl") ||
            (canvas.getContext("experimental-webgl") as WebGLRenderingContext);

        // Check if WebGL is available
        if (!sharedWebGLContext) {
            console.error(
                "Unable to initialize WebGL. Your browser may not support it.",
            );
            return null;
        }
    }

    return sharedWebGLContext;
}
export function fragment_only_shader<
    N extends string,
    U extends GlslUniformDeclaration<N>[],
>(
    uniforms: [...U],
    func: (
        uniforms: {
            [K in keyof U]: MapGlslToBuilder<U[K]["variable_type"]>;
        },
        position: GlslVec2,
        other: {
            scope: BuildScope;
            decl: <T extends GlslBuilder>(value: T) => GlslVariable<T>;
            gl_FragColor: GlslVariable<GlslVec4>;
            gl_FragData: GlslVariable<GlslVec4>;
            gl_FragCoord: GlslVariable<GlslVec4>;
            gl_FrontFacing: GlslVariable<GlslBoolean>;
            gl_PointCoord: GlslVariable<GlslVec2>;
        },
    ) => void,
): (uniforms: ExtractLiterals<N, U>, dim: [number, number]) => number[] {
    const gl = getSharedWebGLContext();
    if (!gl) {
        return () => [];
    }

    const instance = new ShaderInstance(
        {
            attribute: [
                // square
                {
                    name: "aVertexPosition",
                    variable_type: {
                        type: "vec2",
                        precision: "highp",
                    },
                },
            ],
            uniform: uniforms,
            varying: [
                {
                    name: "uPosition",
                    variable_type: {
                        type: "vec2",
                        precision: "highp",
                    },
                },
            ],
        },
        ([], [aPosition], [uPosition], { gl_Position }) => {
            uPosition.set(aPosition);
            gl_Position.set(aPosition.concat([0, 1]));
        },
        (uniforms, [], [position], other) => {
            func(uniforms, position, {
                scope: other.scope,
                decl: other.decl,
                gl_FragColor: other.gl_FragColor,
                gl_FragData: other.gl_FragData,
                gl_FragCoord: other.gl_FragCoord,
                gl_FrontFacing: other.gl_FrontFacing,
                gl_PointCoord: other.gl_PointCoord,
            });
        },
        gl,
    );

    return (uniforms, dim) => {
        gl.viewport(0, 0, dim[0], dim[1]);
        instance.run(uniforms, {
            aVertexPosition: [
                [0, 0],
                [0, dim[1]],
                [dim[0], 0],
                [dim[0], 0],
                [0, dim[1]],
                [dim[0], dim[1]],
            ],
        });

        const pixels = new Float32Array(dim[0] * dim[1] * 4);
        gl.readPixels(0, 0, dim[0], dim[1], gl.RGBA, gl.FLOAT, pixels);
        return Array.from(pixels);
    };
}
