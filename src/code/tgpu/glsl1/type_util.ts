/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    GlslFullType,
    GlslShader,
    GlslStatement,
    GlslVariableDeclaration,
} from ".";
import { GlslInteger } from "./builder/glsl_integer";
import type { MapFromGlslType } from "./type_mapping";
import type { Simplify } from "type-fest";

type Mutable<T> = {
    -readonly [K in keyof T]: Mutable<T[K]>;
};

type GetAttributes<T extends GlslShader> = GetDeclarationsFromStatements<
    T["statements"],
    "attribute"
>;
type GetUniforms<T extends GlslShader> = GetDeclarationsFromStatements<
    T["statements"],
    "uniform"
>;
type GetVaryings<T extends GlslShader> = GetDeclarationsFromStatements<
    T["statements"],
    "varying"
>;

type GetDeclarationsFromStatements<
    Shader extends GlslStatement[],
    Qualifier extends GlslVariableDeclaration["qualifier"],
> = Shader extends [infer H, ...infer T]
    ? H extends GlslStatement
        ? T extends GlslStatement[]
            ?
                  | GetDeclarationFromStatement<H, Qualifier>
                  | GetDeclarationsFromStatements<T, Qualifier>
            : never
        : never
    : never;

type GetDeclarationFromStatement<
    Statement extends GlslStatement,
    Qualifier extends GlslVariableDeclaration["qualifier"],
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
    version: "100",
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

type Attributes = GetAttributes<Mutable<typeof sample>>;
type Uniforms = GetUniforms<Mutable<typeof sample>>;
type Varyings = GetVaryings<Mutable<typeof sample>>;

type GetRequired<Statement extends GlslStatement> = Statement extends {
    type: "variable_declaration";
    variable_type: GlslFullType;
    name: string;
}
    ? {
          [P in Statement["name"]]: MapFromGlslType<Statement["variable_type"]>;
      }
    : never;

export type UnionToIntersection<U> = (
    U extends any ? (k: U) => void : never
) extends (k: infer I) => void
    ? I
    : never;

type Required = Simplify<UnionToIntersection<GetRequired<Varyings>>>;
