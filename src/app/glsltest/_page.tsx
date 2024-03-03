"use client";

import { panic } from "functional-utilities";
import { useEffect, useRef } from "react";
import { ShaderInstance } from "~/code/tgpu/webgl1";
import { useAnimationTime } from "~/utils/use_update";

function create_instance(gl: WebGLRenderingContext) {
    return new ShaderInstance(
        {
            uniform: [
                {
                    name: "uTime",
                    variable_type: { type: "float", precision: "highp" },
                },
            ],
            attribute: [
                {
                    name: "aVertexPosition",
                    variable_type: { type: "vec3", precision: "highp" },
                },
                {
                    name: "aVertexColor",
                    variable_type: { type: "vec3", precision: "highp" },
                },
            ],
            varying: [
                {
                    name: "vColor",
                    variable_type: { type: "vec3", precision: "highp" },
                },
            ],
        },
        (
            [uTime],
            [aVertexPosition, aVertexColor],
            [vColor],
            { gl_Position },
        ) => {
            gl_Position.set(aVertexPosition.concat(1));
            const time_factor = uTime.sin().mul(0.5).add(0.5);
            vColor.set(aVertexColor.mul(time_factor.concat([1, 1])));
        },
        ([], [], [vColor], { gl_FragColor }) => {
            gl_FragColor.set(vColor.concat(1));
        },
        gl,
    );
}

function Page() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const instanceRef = useRef<ReturnType<typeof create_instance> | null>(null);

    const time = useAnimationTime();

    useEffect(() => {
        if (!canvasRef.current) return;

        const gl =
            canvasRef.current.getContext("webgl") ??
            panic("WebGL not supported");

        const instance = create_instance(gl);
        instanceRef.current = instance;
    }, []);

    useEffect(() => {
        if (!instanceRef.current) return;

        instanceRef.current.run(
            {
                uTime: time / 1000,
            },
            {
                aVertexColor: [
                    [1, 0, 0],
                    [0, 1, 0],
                    [0, 0, 1],
                ],
                aVertexPosition: [
                    [0, 1, 0],
                    [-1, -1, 0],
                    [1, -1, 0],
                ],
            },
        );
    }, [time]);

    return (
        <div>
            <canvas
                ref={canvasRef}
                className="w-screen h-screen"
                width={1920}
                height={1080}
            />
        </div>
    );
}

export default Page;
