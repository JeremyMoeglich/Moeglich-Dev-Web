/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    GlslAnyShader,
    GlslFullType,
    GlslShader,
    GlslShaderKind,
    GlslStatement,
    GlslVariableDeclaration,
} from ".";
import { GlslInteger } from "./builder/glsl_integer";
import type { MapGlslToLiteral } from "./type_mapping";
import type { Simplify } from "type-fest";

type Mutable<T> = {
    -readonly [K in keyof T]: Mutable<T[K]>;
};

type GetAttributes<
    N extends string,
    T extends GlslAnyShader,
> = GetDeclarationsFromStatements<N, T["statements"], "attribute">;
type GetUniforms<
    N extends string,
    T extends GlslAnyShader,
> = GetDeclarationsFromStatements<N, T["statements"], "uniform">;
type GetVaryings<
    N extends string,
    T extends GlslAnyShader,
> = GetDeclarationsFromStatements<N, T["statements"], "varying">;

type GetDeclarationsFromStatements<
    N extends string,
    Shader extends GlslStatement<1 | 2, GlslShaderKind>[],
    Qualifier extends GlslVariableDeclaration<1 | 2, GlslShaderKind, N>["qualifier"],
> = Shader extends [infer H, ...infer T]
    ? H extends GlslStatement<1 | 2, GlslShaderKind>
        ? T extends GlslStatement<1 | 2, GlslShaderKind>[]
            ?
                  | GetDeclarationFromStatement<N, H, Qualifier>
                  | GetDeclarationsFromStatements<N, T, Qualifier>
            : never
        : never
    : never;

type GetDeclarationFromStatement<
    N extends string,
    Statement extends GlslStatement<1 | 2, GlslShaderKind>,
    Qualifier extends GlslVariableDeclaration<1 | 2, GlslShaderKind, N>["qualifier"],
> = Statement extends {
    type: "variable_declaration";
    qualifier: Qualifier;
}
    ? Statement
    : never;

const data = new GlslInteger({ type: "variable", name: "a" })
    .add(5)
    .mul(2)
    .eq(10);
const sample = {
    version: 1,
    statements: [
        {
            type: "variable_declaration",
            name: "a",
            invariant: false,
            qualifier: "uniform",
            variable_type: {
                type: "int",
            },
        },
        {
            type: "variable_declaration",
            name: "b",
            invariant: false,
            qualifier: "attribute",
            variable_type: {
                type: "float",
                precision: "highp",
            },
        },
        {
            type: "variable_declaration",
            name: "c",
            invariant: false,
            qualifier: "varying",
            variable_type: {
                type: "vec2",
                precision: "highp",
            },
        },
        {
            type: "variable_declaration",
            name: "d",
            invariant: false,
            qualifier: "varying",
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
                {
                    type: "variable_declaration",
                    invariant: false,
                    name: "test",
                    variable_type: {
                        type: "int",
                    },
                    initializer: data.origin,
                },
            ],
        },
    ],
} as const;

type Attributes = GetAttributes<string, Mutable<typeof sample>>;
type Uniforms = GetUniforms<string, Mutable<typeof sample>>;
type Varyings = GetVaryings<string, Mutable<typeof sample>>;

type GetRequired<Statement extends GlslStatement<1 | 2, GlslShaderKind>> = Statement extends {
    type: "variable_declaration";
    variable_type: GlslFullType<1 | 2>;
    name: string;
}
    ? {
          [P in Statement["name"]]: MapGlslToLiteral<
              Statement["variable_type"]
          >;
      }
    : never;

export type UnionToIntersection<U> = (
    U extends any ? (k: U) => void : never
) extends (k: infer I) => void
    ? I
    : never;

type Required = Simplify<UnionToIntersection<GetRequired<Varyings>>>;
