/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { SHA256 } from "crypto-js";
import type { GlslFloatType, GlslFullType, GlslShader, GlslStatement } from ".";
import type { Trackable } from "./builder/proto";
import {
    type MapGlslToBuilder,
    map_glsl_to_builder,
} from "./builder/to_builder";
import { extract_common_expressions, take_unique_var } from "./extract_common";

export function create_glsl_shader<
    U extends GlslFullType[],
    I extends GlslFloatType[],
    V extends GlslFloatType[],
    R extends Trackable<GlslFullType["type"]>,
>(
    uniform: [...U],
    input: [...I],
    varying: [...V],
    func: (
        uniform: { [K in keyof U]: MapGlslToBuilder<U[K]> },
        input: { [K in keyof I]: MapGlslToBuilder<I[K]> },
        varying: { [K in keyof V]: MapGlslToBuilder<V[K]> },
    ) => R,
): GlslShader {
    const vars = new Map<string, GlslFullType>();
    const statements: GlslStatement[] = [];
    const uniforms = uniform.map((u, i) => {
        const name = take_unique_var(
            vars,
            SHA256(
                JSON.stringify({
                    u,
                    i,
                    t: "uniform"
                }),
            ).toString(),
            u,
        );
        statements.push({
            type: "variable_declaration",
            name,
            invariant: false,
            variable_type: u,
            qualifier: "uniform",
        });
        return map_glsl_to_builder(u, {
            type: "variable",
            name,
        });
    });
    const attributes = input.map((u, i) => {
        const name = take_unique_var(
            vars,
            SHA256(
                JSON.stringify({
                    u,
                    i,
                    t: "attribute"
                }),
            ).toString(),
            u,
        );
        statements.push({
            type: "variable_declaration",
            name,
            invariant: false,
            variable_type: u,
            qualifier: "attribute",
        });
        return map_glsl_to_builder(u, {
            type: "variable",
            name,
        });
    });
    const varyings = varying.map((u, i) => {
        const name = take_unique_var(
            vars,
            SHA256(
                JSON.stringify({
                    u,
                    i,
                    t: "varying"
                }),
            ).toString(),
            u,
        );
        statements.push({
            type: "variable_declaration",
            name,
            invariant: false,
            variable_type: u,
            qualifier: "varying",
        });
        return map_glsl_to_builder(u, {
            type: "variable",
            name,
        });
    });
    const result = func(uniforms as any, attributes as any, varyings as any);
    const extracted = extract_common_expressions(vars, result.origin);
    statements.push({
        type: "function_declaration",
        name: "main",
        return_type: { type: "void" },
        parameters: [],
        body: [...extracted.statements],
    });

    return {
        version: "100",
        statements,
    };
}
