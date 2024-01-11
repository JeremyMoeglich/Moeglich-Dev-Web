import type { GlslExpression } from "..";
import type { GlslBoolean } from "./glsl_boolean";
import { GlslBVec3 } from "./glsl_bvec3";
import { GlslBVec4 } from "./glsl_bvec4";
import { makeGlslBVec2 } from "./literals";
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

export type ToGlslBVec2 =
    | [boolean, boolean]
    | boolean
    | GlslBoolean
    | GlslBVec2;
const GlslBVec2Proto = build_proto([
    equality_proto(makeGlslBVec2),
    {
        concat: function (
            this: GlslBVec2,
            other:
                | GlslBVec2
                | [boolean, boolean]
                | boolean
                | GlslBoolean
                | [boolean],
        ) {
            if (is_trackable(other, "bvec2")) {
                return new GlslBVec4({
                    type: "function_call",
                    name: "bvec4",
                    arguments: [this.origin, other.origin],
                });
            } else if (Array.isArray(other)) {
                if (other.length === 1) {
                    return new GlslBVec3({
                        type: "function_call",
                        name: "bvec3",
                        arguments: [
                            this.origin,
                            {
                                type: "literal",
                                value: other[0],
                                literal_type: "boolean",
                            },
                        ],
                    });
                } else {
                    return new GlslBVec4({
                        type: "function_call",
                        name: "vec4",
                        arguments: [
                            this.origin,
                            {
                                type: "literal",
                                value: other[0],
                                literal_type: "boolean",
                            },
                            {
                                type: "literal",
                                value: other[1],
                                literal_type: "boolean",
                            },
                        ],
                    });
                }
            } else if (typeof other === "boolean") {
                return new GlslBVec3({
                    type: "function_call",
                    name: "bvec3",
                    arguments: [
                        this.origin,
                        {
                            type: "literal",
                            value: other,
                            literal_type: "boolean",
                        },
                    ],
                });
            } else {
                return new GlslBVec3({
                    type: "function_call",
                    name: "bvec3",
                    arguments: [this.origin, other.origin],
                });
            }
        } as ((
            this: GlslBVec2,
            other: GlslBVec2 | [boolean, boolean],
        ) => GlslBVec4) &
            ((
                this: GlslBVec2,
                other: number | GlslBoolean | [number],
            ) => GlslBVec3),
        pick: function <N extends VecInferable<0 | 1>>(
            this: GlslBVec2,
            index: N,
        ): InferVecLength<0 | 1, N> {
            return swizzle_from_index(this.origin, index);
        },
    },
]);
export const GlslBVec2 = function (
    this: GlslBVec2,
    value: GlslExpression | ToGlslBVec2,
) {
    if (is_trackable(value, "bvec2")) {
        this.origin = value.origin;
    } else if (is_trackable(value, "bool")) {
        this.origin = {
            type: "function_call",
            name: "bvec2",
            arguments: [value.origin],
        };
    } else if (typeof value === "boolean") {
        this.origin = {
            type: "function_call",
            name: "bvec2",
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
            name: "bvec2",
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
            ],
        };
    } else {
        this.origin = value;
    }
    this.glsl_name = "bvec2";
} as unknown as new (value: GlslExpression | ToGlslBVec2) => GlslBVec2;
Object.assign(GlslBVec2.prototype, GlslBVec2Proto);
export type GlslBVec2 = Trackable<"bvec2"> & {
    eq: (other: GlslBVec2 | ToGlslBVec2) => GlslBoolean;
    ne: (other: GlslBVec2 | ToGlslBVec2) => GlslBoolean;

    pick: <N extends VecInferable<0 | 1>>(index: N) => InferVecLength<0 | 1, N>;
    concat: ((other: GlslBVec2 | [boolean, boolean]) => GlslBVec4) &
        ((other: boolean | GlslBoolean | [boolean]) => GlslBVec3);
} & {
    new (origin: GlslExpression): GlslBVec2;
};
