import type { GlslExpression } from "..";
import type { GlslBoolean } from "./glsl_boolean";
import { makeGlslBVec4 } from "./literals";
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

export type ToGlslBVec4 =
    | [boolean, boolean, boolean, boolean]
    | boolean
    | GlslBoolean
    | GlslBVec4;
const GlslBVec4Proto = build_proto([
    equality_proto(makeGlslBVec4),
    {
        pick: function <N extends VecInferable<0 | 1 | 2 | 3>>(
            this: GlslBVec4,
            index: N,
        ): InferVecLength<0 | 1 | 2 | 3, N> {
            return swizzle_from_index(this.origin, index);
        },
    },
]);
export const GlslBVec4 = function (
    this: GlslBVec4,
    value: GlslExpression | ToGlslBVec4,
) {
    if (is_trackable(value, "bvec4")) {
        this.origin = value.origin;
    } else if (is_trackable(value, "bool")) {
        this.origin = {
            type: "function_call",
            name: "bvec4",
            arguments: [value.origin],
        };
    } else if (typeof value === "boolean") {
        this.origin = {
            type: "function_call",
            name: "bvec4",
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
            name: "bvec4",
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
    this.glsl_name = "bvec4";
} as unknown as new (
    value: GlslExpression | ToGlslBVec4,
) => GlslBVec4;
Object.assign(GlslBVec4.prototype, GlslBVec4Proto);
export type GlslBVec4 = Trackable<"bvec4"> & {
    eq: (other: GlslBVec4 | ToGlslBVec4) => GlslBoolean;
    ne: (other: GlslBVec4 | ToGlslBVec4) => GlslBoolean;

    pick: <N extends VecInferable<0 | 1 | 2 | 3>>(
        index: N,
    ) => InferVecLength<0 | 1 | 2 | 3, N>;
} & {
    new (origin: GlslExpression): GlslBVec4;
};
