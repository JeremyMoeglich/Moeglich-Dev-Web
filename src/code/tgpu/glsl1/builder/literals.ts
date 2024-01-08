import type { GlslExpression } from "..";
import { GlslBoolean, type ToGlslBoolean } from "./glsl_boolean";
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