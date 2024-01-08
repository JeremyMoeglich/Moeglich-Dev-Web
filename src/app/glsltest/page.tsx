"use client";

import { type GlslFullType, build_glsl_shader } from "~/code/tgpu/glsl1";
import { GlslVec2 } from "~/code/tgpu/glsl1/builder/glsl_vec2";
import { extract_common_expressions } from "~/code/tgpu/glsl1/extract_common";

function Page() {
    const v1 = new GlslVec2({ type: "variable", name: "a" })
        .concat([5])
        .pick([2, 1, 2]);
    const v2 = v1.add([1, 2, 3]).mul(v1).pick(1);
    const vars: Map<string, GlslFullType> = new Map();
    vars.set("a", {
        type: "vec2",
        precision: "highp",
    });
    const extracted = extract_common_expressions(vars, v2.origin);
    const text = build_glsl_shader({
        version: "100",
        statements: [
            {
                type: "variable_declaration",
                name: "a",
                invariant: false,
                qualifier: "uniform",
                variable_type: {
                    type: "vec2",
                    precision: "highp",
                },
            },
            {
                type: "function_declaration",
                name: "main",
                return_type: {
                    type: "void",
                },
                parameters: [],
                body: [
                    ...extracted.statements,
                    {
                        type: "variable_declaration",
                        name: "output",
                        invariant: false,
                        initializer: {
                            type: "variable",
                            name: extracted.variable.name,
                        },
                        variable_type: {
                            type: "int",
                        },
                    },
                ],
            },
        ],
    });
    return (
        <div>
            <h1>GLSL Test</h1>
            <code className="whitespace-pre-wrap">{text}</code>
        </div>
    );
}

export default Page;
