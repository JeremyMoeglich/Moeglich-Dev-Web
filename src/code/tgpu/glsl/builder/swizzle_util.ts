import { panic } from "functional-utilities";
import type { GlslExpression } from "..";
import { GlslFloat } from "./glsl_float";
import { GlslVec2 } from "./glsl_vec2";
import { GlslVec3 } from "./glsl_vec3";
import { GlslVec4 } from "./glsl_vec4";

export type VecInferable<T extends number> =
    | T
    | [T]
    | [T, T]
    | [T, T, T]
    | [T, T, T, T];

export type InferVecLength<
    T extends number,
    N extends VecInferable<T>,
> = N extends T | [T]
    ? GlslFloat
    : N extends [T, T]
      ? GlslVec2
      : N extends [T, T, T]
          ? GlslVec3
          : N extends [T, T, T, T]
              ? GlslVec4
              : never;

export function swizzle_from_index<T extends number, N extends VecInferable<T>>(
    expression: GlslExpression,
    index: N,
): InferVecLength<T, N> {
    const map = {
        0: "x",
        1: "y",
        2: "z",
        3: "w",
    };
    const i = (Array.isArray(index) ? index : [index]) as number[];
    const swizzle_str = i
        .map(
            (i) =>
                map[i as keyof typeof map] ??
                panic(`Invalid swizzle index ${i}`),
        )
        .join("");
    const expr: GlslExpression = {
        type: "swizzle",
        vector: expression,
        swizzle: swizzle_str,
    };
    if (typeof index === "number") {
        return new GlslFloat(expr) as any;
    }
    if (index.length === 1) {
        return new GlslFloat(expr) as any;
    }
    if (index.length === 2) {
        return new GlslVec2(expr) as any;
    }
    if (index.length === 3) {
        return new GlslVec3(expr) as any;
    }
    if (index.length === 4) {
        return new GlslVec4(expr) as any;
    }

    throw new Error("Invalid swizzle index");
}
