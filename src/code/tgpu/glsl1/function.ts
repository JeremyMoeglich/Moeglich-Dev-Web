/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { SHA256 } from "crypto-js";
import type {
    GlslAttributeDeclaration,
    GlslFloatType,
    GlslFullType,
    GlslShader,
    GlslStatement,
    GlslUniformDeclaration,
    GlslVariableDeclaration,
    GlslVaryingDeclaration,
} from ".";
import {
    type MapGlslToBuilder,
    map_glsl_to_builder,
    GlslBuilder,
} from "./builder/to_builder";
import { take_unique_var } from "./extract_common";
import { GlslVariable } from "./builder/glsl_var";
import { BuildScope } from "./builder/scope";
import { GlslVec4 } from "./builder/glsl_vec4";
import { GlslFloat } from "./builder/glsl_float";
import { GlslBoolean } from "./builder/glsl_boolean";
import { GlslVec2 } from "./builder/glsl_vec2";
import { infer_glsl_type } from "./infer_type";

export type GlslShaderFunction<
    U extends GlslUniformDeclaration<N>[],
    A extends GlslAttributeDeclaration<N>[],
    V extends GlslVaryingDeclaration<N>[],
    K extends "vertex" | "fragment",
    N extends string,
> = (
    uniform: { [K in keyof U]: MapGlslToBuilder<U[K]["variable_type"]> },
    input: { [K in keyof A]: MapGlslToBuilder<A[K]["variable_type"]> },
    varying: {
        [K in keyof V]: K extends "vertex"
            ? GlslVariable<MapGlslToBuilder<V[K]["variable_type"]>>
            : MapGlslToBuilder<V[K]["variable_type"]>;
    },
    other: {
        scope: BuildScope;
        decl: <T extends GlslBuilder>(value: T) => GlslVariable<T>;
    } & (K extends "vertex"
        ? {
              gl_Position: GlslVariable<GlslVec4>;
              gl_PointSize: GlslVariable<GlslFloat>;
          }
        : {
              gl_FragColor: GlslVariable<GlslVec4>;
              gl_FragData: GlslVariable<GlslVec4>;
              gl_FragCoord: GlslVariable<GlslVec4>;
              gl_FrontFacing: GlslVariable<GlslBoolean>;
              gl_PointCoord: GlslVariable<GlslVec2>;
          }),
) => void;

export function create_glsl_shader<
    U extends GlslUniformDeclaration<N>[],
    A extends GlslAttributeDeclaration<N>[],
    V extends GlslVaryingDeclaration<N>[],
    K extends "vertex" | "fragment",
    N extends string,
>(
    uniform: [...U],
    input: [...A],
    varying: [...V],
    kind: K,
    func: GlslShaderFunction<U, A, V, K, N>,
): GlslShader {
    const vars = new Map<string, GlslFullType>();
    const top_level_statements: GlslStatement[] = [];
    const main_statements: GlslStatement[] = [];
    const scope: BuildScope = {
        vars,
        statements: main_statements,
    };
    const uniforms = uniform.map((u, i) => {
        top_level_statements.push({
            type: "variable_declaration",
            qualifier: "uniform",
            ...u,
        });
        return map_glsl_to_builder(u.variable_type, {
            type: "variable",
            name: u.name,
        });
    });
    const attributes = input.map((u, i) => {
        top_level_statements.push({
            type: "variable_declaration",
            qualifier: "attribute",
            ...u,
        });
        return map_glsl_to_builder(u.variable_type, {
            type: "variable",
            name: u.name,
        });
    });
    const varyings = varying.map((u, i) => {
        top_level_statements.push({
            type: "variable_declaration",
            qualifier: "varying",
            ...u,
        });
        return new GlslVariable(
            map_glsl_to_builder(u.variable_type, {
                type: "variable",
                name: u.name,
            }),
            scope,
        );
    });

    func(uniforms as any, attributes as any, varyings as any, {
        scope,
        decl: <T extends GlslBuilder>(value: T) => {
            const hash = SHA256(
                JSON.stringify({
                    value,
                }),
            ).toString();
            const type = infer_glsl_type(vars, value.origin);
            const name = take_unique_var(vars, hash, type);
            scope.statements.push({
                type: "variable_declaration",
                name,
                initializer: value.origin,
                invariant: false,
                variable_type: type,
            });
            return new GlslVariable(
                map_glsl_to_builder(type, {
                    type: "variable",
                    name,
                }),
                scope,
            );
        },
        gl_Position: new GlslVariable(
            new GlslVec4({
                type: "variable",
                name: "gl_Position",
            }),
            scope,
        ),
        gl_PointSize: new GlslVariable(
            new GlslFloat({
                type: "variable",
                name: "gl_PointSize",
            }),
            scope,
        ),
        gl_FragColor: new GlslVariable(
            new GlslVec4({
                type: "variable",
                name: "gl_FragColor",
            }),
            scope,
        ),
        gl_FragData: new GlslVariable(
            new GlslVec4({
                type: "variable",
                name: "gl_FragData",
            }),
            scope,
        ),
        gl_FragCoord: new GlslVariable(
            new GlslVec4({
                type: "variable",
                name: "gl_FragCoord",
            }),
            scope,
        ),
        gl_FrontFacing: new GlslVariable(
            new GlslBoolean({
                type: "variable",
                name: "gl_FrontFacing",
            }),
            scope,
        ),
        gl_PointCoord: new GlslVariable(
            new GlslVec2({
                type: "variable",
                name: "gl_PointCoord",
            }),
            scope,
        ),
    });
    top_level_statements.push({
        type: "function_declaration",
        name: "main",
        return_type: { type: "void" },
        parameters: [],
        body: [...main_statements],
    });

    return {
        version: "100",
        statements: top_level_statements,
    };
}
