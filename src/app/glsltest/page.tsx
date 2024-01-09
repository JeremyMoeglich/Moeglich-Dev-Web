"use client";

import { panic } from "functional-utilities";
import { useEffect, useRef } from "react";
import { build_glsl_shader } from "~/code/tgpu/glsl1";
import { create_glsl_shader } from "~/code/tgpu/glsl1/function";
import { ShaderInstance } from "~/code/tgpu/webgl1";

function Page() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const gl =
            canvasRef.current.getContext("webgl") ??
            panic("WebGL not supported");

        const instance = new ShaderInstance(
            {
                attribute: [
                    {
                        name: "a_position",
                        variable_type: { type: "vec2", precision: "highp" },
                        qualifier: "attribute",
                    },
                ],
                uniform: [
                    {
                        name: "u_resolution",
                        variable_type: { type: "vec2", precision: "highp" },
                        qualifier: "uniform",
                    },
                    {
                        name: "u_time",
                        variable_type: { type: "float", precision: "highp" },
                        qualifier: "uniform",
                    },
                ],
                varying: [
                    {
                        name: "v_position",
                        variable_type: { type: "vec2", precision: "highp" },
                        qualifier: "varying",
                    },
                ],
            },
            ([a_position], [u_resolution], [v_position], { gl_Position }) => {
                v_position = a_position.div(u_resolution.div(2)).sub(1);
                gl_Position.set(v_position.pick([0, 1, 0, 1]));
            },
            ([], [], [v_position], { gl_FragColor }) => {
                gl_FragColor.set(v_position.div(2).concat([0, 1]));
            },
            gl,
        );

        instance.run(
            {
                u_resolution: [512, 512],
                u_time: 0,
            },
            {
                a_position: [
                    [-1, -1],
                    [1, -1],
                    [1, 1],
                    [-1, 1],
                ],
            },
        );
    }, []);

    return (
        <div>
            <h1>GLSL Test</h1>
            <canvas ref={canvasRef} width={512} height={512} />
        </div>
    );
}

export default Page;
