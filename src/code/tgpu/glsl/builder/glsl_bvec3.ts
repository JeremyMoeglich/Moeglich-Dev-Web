import type { GlslExpression } from "..";
import type { GlslBoolean } from "./glsl_boolean";
import { GlslBVec4 } from "./glsl_bvec4";
import { makeGlslBVec3, makeGlslBoolean } from "./literals";
import {
    type Trackable,
    build_proto,
    equality_proto,
    is_trackable,
} from "./proto";
import {
    type InferVecLength,
    type VecInferable,
    swizzle_from_index,
} from "./swizzle_util";

export type ToGlslBVec3 =
    | [boolean, boolean, boolean]
    | boolean
    | GlslBoolean
    | GlslBVec3;
const GlslBVec3Proto = build_proto([
    equality_proto(makeGlslBVec3),
    {
        concat: function (
            this: GlslBVec3,
            other: boolean | GlslBoolean | [boolean],
        ) {
            return new GlslBVec4({
                type: "function_call",
                name: "vec4",
                arguments: [
                    this.origin,
                    makeGlslBoolean(Array.isArray(other) ? other[0] : other)
                        .origin,
                ],
            });
        },
        pick: function <N extends VecInferable<0 | 1 | 2>>(
            this: GlslBVec3,
            index: N,
        ): InferVecLength<0 | 1 | 2, N> {
            return swizzle_from_index(this.origin, index);
        },
    },
]);
export const GlslBVec3 = function (
    this: GlslBVec3,
    value: GlslExpression | ToGlslBVec3,
) {
    if (is_trackable(value, "bvec3")) {
        this.origin = value.origin;
    } else if (is_trackable(value, "bool")) {
        this.origin = {
            type: "function_call",
            name: "bvec3",
            arguments: [value.origin],
        };
    } else if (typeof value === "boolean") {
        this.origin = {
            type: "function_call",
            name: "bvec3",
            arguments: [
                {
                    type: "literal",
                    value: value,
                    literal_type: "boolean",
                },
            ],
        };
    } else if (Array.isArray(value)) {
        this.origin = {
            type: "function_call",
            name: "bvec3",
            arguments: [
                {
                    type: "literal",
                    value: value[0],
                    literal_type: "boolean",
                },
                {
                    type: "literal",
                    value: value[1],
                    literal_type: "boolean",
                },
                {
                    type: "literal",
                    value: value[2],
                    literal_type: "boolean",
                },
            ],
        };
    } else {
        this.origin = value;
    }
    this.glsl_name = "bvec3";
} as unknown as new (
    value: GlslExpression | ToGlslBVec3,
) => GlslBVec3;
Object.assign(GlslBVec3.prototype, GlslBVec3Proto);
export type GlslBVec3 = Trackable<"bvec3"> & {
    eq: (other: GlslBVec3 | ToGlslBVec3) => GlslBoolean;
    ne: (other: GlslBVec3 | ToGlslBVec3) => GlslBoolean;

    pick: <N extends VecInferable<0 | 1 | 2>>(
        index: N,
    ) => InferVecLength<0 | 1 | 2, N>;
    concat: (other: boolean | GlslBoolean | [boolean]) => GlslBVec4;
} & {
    new (origin: GlslExpression): GlslBVec3;
};
