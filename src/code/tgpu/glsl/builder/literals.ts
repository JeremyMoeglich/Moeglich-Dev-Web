import type { GlslExpression } from "..";
import { GlslBoolean, type ToGlslBoolean } from "./glsl_boolean";
import { GlslBVec2, type ToGlslBVec2 } from "./glsl_bvec2";
import { GlslBVec3, type ToGlslBVec3 } from "./glsl_bvec3";
import { GlslBVec4, type ToGlslBVec4 } from "./glsl_bvec4";
import { GlslFloat, type ToGlslFloat } from "./glsl_float";
import { GlslInteger, type ToGlslInteger } from "./glsl_integer";
import { GlslVec2, type ToGlslVec2 } from "./glsl_vec2";
import { GlslVec3, type ToGlslVec3 } from "./glsl_vec3";
import { GlslVec4, type ToGlslVec4 } from "./glsl_vec4";

export function wrap_bool(v: GlslExpression) {
    return new GlslBoolean(v);
}
export function makeGlslBoolean(value: ToGlslBoolean): GlslBoolean {
    return new GlslBoolean(value);
}

export function wrap_int(v: GlslExpression) {
    return new GlslInteger(v);
}
export function makeGlslInteger(value: ToGlslInteger): GlslInteger {
    return new GlslInteger(value);
}

export function makeGlslFloat(value: ToGlslFloat): GlslFloat {
    return new GlslFloat(value);
}
export function wrap_float(v: GlslExpression) {
    return new GlslFloat(v);
}

export function wrap_vec2(v: GlslExpression) {
    return new GlslVec2(v);
}
export function makeGlslVec2(value: ToGlslVec2): GlslVec2 {
    return new GlslVec2(value);
}

export function wrap_vec3(v: GlslExpression) {
    return new GlslVec3(v);
}
export function makeGlslVec3(value: ToGlslVec3): GlslVec3 {
    return new GlslVec3(value);
}

export function wrap_vec4(v: GlslExpression) {
    return new GlslVec4(v);
}
export function makeGlslVec4(value: ToGlslVec4): GlslVec4 {
    return new GlslVec4(value);
}

export function wrap_bvec2(v: GlslExpression) {
    return new GlslBVec2(v);
}
export function makeGlslBVec2(value: ToGlslBVec2): GlslBVec2 {
    return new GlslBVec2(value);
}

export function wrap_bvec3(v: GlslExpression) {
    return new GlslBVec3(v);
}
export function makeGlslBVec3(value: ToGlslBVec3): GlslBVec3 {
    return new GlslBVec3(value);
}

export function wrap_bvec4(v: GlslExpression) {
    return new GlslBVec4(v);
}
export function makeGlslBVec4(value: ToGlslBVec4): GlslBVec4 {
    return new GlslBVec4(value);
}
