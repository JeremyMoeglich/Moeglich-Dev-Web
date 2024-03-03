import type { GlslExpression } from "..";
import { GlslBVec2 } from "./glsl_bvec2";
import { GlslBVec3 } from "./glsl_bvec3";
import { GlslBVec4 } from "./glsl_bvec4";
import { makeGlslBoolean } from "./literals";
import {
    type Trackable,
    boolean_proto,
    build_proto,
    relation_proto,
    equality_proto,
    is_trackable,
} from "./proto";

export type ToGlslBoolean = boolean | GlslBoolean;
const GlslBooleanProto = build_proto([
    equality_proto(makeGlslBoolean),
    relation_proto(makeGlslBoolean),
    boolean_proto(makeGlslBoolean),
    {
        concat: function (
            this: GlslBoolean,
            other: GlslBoolean | boolean | GlslBVec2 | GlslBVec3,
        ) {
            if (is_trackable(other, "bvec2")) {
                return new GlslBVec3({
                    type: "function_call",
                    name: "bvec3",
                    arguments: [this.origin, other.origin],
                });
            }
            if (is_trackable(other, "bvec3")) {
                return new GlslBVec4({
                    type: "function_call",
                    name: "bvec4",
                    arguments: [this.origin, other.origin],
                });
            }
            if (typeof other === "boolean") {
                return new GlslBVec2({
                    type: "function_call",
                    name: "bvec2",
                    arguments: [
                        this.origin,
                        {
                            type: "literal",
                            value: other,
                            literal_type: "boolean",
                        },
                    ],
                });
            }
            return new GlslBVec2({
                type: "function_call",
                name: "bvec2",
                arguments: [this.origin, other.origin],
            });
        } as ((this: GlslBoolean, other: GlslBoolean | boolean) => GlslBVec2) &
            ((this: GlslBoolean, other: GlslBVec2) => GlslBVec3) &
            ((this: GlslBoolean, other: GlslBVec3) => GlslBVec4),
    },
]);
export const GlslBoolean = function (
    this: GlslBoolean,
    value: GlslExpression | ToGlslBoolean,
) {
    if (is_trackable(value, "bool")) {
        this.origin = value.origin;
    } else if (typeof value === "boolean") {
        this.origin = {
            type: "literal",
            value: value,
            literal_type: "boolean",
        };
    } else {
        this.origin = value;
    }
    this.glsl_name = "bool";
} as unknown as new (
    origin: GlslExpression | ToGlslBoolean,
) => GlslBoolean;
Object.assign(GlslBoolean.prototype, GlslBooleanProto);
export type GlslBoolean = Trackable<"bool"> & {
    eq: (other: GlslBoolean | boolean) => GlslBoolean;
    ne: (other: GlslBoolean | boolean) => GlslBoolean;

    lt: (other: GlslBoolean | boolean) => GlslBoolean;
    le: (other: GlslBoolean | boolean) => GlslBoolean;
    gt: (other: GlslBoolean | boolean) => GlslBoolean;
    ge: (other: GlslBoolean | boolean) => GlslBoolean;

    and: (other: GlslBoolean | boolean) => GlslBoolean;
    or: (other: GlslBoolean | boolean) => GlslBoolean;
    not: () => GlslBoolean;

    concat: ((other: GlslBoolean | boolean) => GlslBVec2) &
        ((other: GlslBVec2) => GlslBVec3) &
        ((other: GlslBVec3) => GlslBVec4);
} & {
    new (origin: GlslExpression): GlslBoolean;
};
