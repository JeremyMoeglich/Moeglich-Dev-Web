"use client";

import { build_glsl_shader } from "~/code/tgpu/glsl1";
import { GlslFloat } from "~/code/tgpu/glsl1/builder/glsl_float";
import { GlslVariable } from "~/code/tgpu/glsl1/builder/glsl_var";
import { BuildScope } from "~/code/tgpu/glsl1/builder/scope";
import { create_glsl_shader } from "~/code/tgpu/glsl1/function";

function Page() {
    const f2 = create_glsl_shader(
        [{ type: "float", precision: "highp" }],
        [{ type: "float", precision: "highp" }],
        [],
        ([a], [b]) => {
            return a.add(b).mul(a).div(2);
        }
    )

    const scope: BuildScope = {
        vars: new Map(),
        statements: []
    }
    const e = new GlslFloat(1);
    const v = new GlslVariable(e, scope);
    v.set(v.pow(v));
    v.set(v.mul(2));

    const text = build_glsl_shader({
        version: "100",
        statements: scope.statements,
    });
    return (
        <div>
            <h1>GLSL Test</h1>
            <code className="whitespace-pre-wrap">{text}</code>
        </div>
    );
}

export default Page;
