import type { GlslExpression, GlslFullType } from "..";
import { GlslBoolean } from "./glsl_boolean";
import { GlslBVec2 } from "./glsl_bvec2";
import { GlslBVec3 } from "./glsl_bvec3";
import { GlslBVec4 } from "./glsl_bvec4";
import { GlslFloat } from "./glsl_float";
import { GlslInteger } from "./glsl_integer";
import { GlslVec2 } from "./glsl_vec2";
import { GlslVec3 } from "./glsl_vec3";
import { GlslVec4 } from "./glsl_vec4";

// prettier-ignore
export type MapGlslToBuilder<T extends GlslFullType> =
    T extends { type: "void" } ? never :
    T extends { type: "bool" } ? GlslBoolean :
    T extends { type: "int" } ? GlslInteger :
    T extends { type: "bvec2" } ? GlslBVec2 :
    T extends { type: "bvec3" } ? GlslBVec3 :
    T extends { type: "bvec4" } ? GlslBVec4 :
    T extends { type: "ivec2" } ? never :
    T extends { type: "ivec3" } ? never :
    T extends { type: "ivec4" } ? never :
    T extends { type: "float" } ? GlslFloat :
    T extends { type: "vec2" } ? GlslVec2 :
    T extends { type: "vec3" } ? GlslVec3 :
    T extends { type: "vec4" } ? GlslVec4 :
    T extends { type: "mat2" } ? never :
    T extends { type: "mat3" } ? never :
    T extends { type: "mat4" } ? never :
    T extends { type: "sampler2D" } ? never :
    T extends { type: "samplerCube" } ? never :
    never;

export type GlslBuilder =
    | GlslBoolean
    | GlslInteger
    | GlslFloat
    | GlslVec2
    | GlslVec3
    | GlslVec4
    | GlslBVec2
    | GlslBVec3
    | GlslBVec4;

export function map_glsl_to_builder<T extends GlslFullType>(
    t: T,
    origin: GlslExpression,
): MapGlslToBuilder<T> {
    switch (t.type) {
        case "bool":
            return new GlslBoolean(origin) as MapGlslToBuilder<T>;
        case "int":
            return new GlslInteger(origin) as MapGlslToBuilder<T>;
        case "float":
            return new GlslFloat(origin) as MapGlslToBuilder<T>;
        case "vec2":
            return new GlslVec2(origin) as MapGlslToBuilder<T>;
        case "vec3":
            return new GlslVec3(origin) as MapGlslToBuilder<T>;
        case "vec4":
            return new GlslVec4(origin) as MapGlslToBuilder<T>;
        case "bvec2":
            return new GlslBVec2(origin) as MapGlslToBuilder<T>;
        case "bvec3":
            return new GlslBVec3(origin) as MapGlslToBuilder<T>;
        case "bvec4":
            return new GlslBVec4(origin) as MapGlslToBuilder<T>;
        default:
            throw new Error("Not implemented");
    }
}
