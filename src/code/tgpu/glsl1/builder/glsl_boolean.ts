import type { GlslExpression } from "..";
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
} as unknown as new (origin: GlslExpression | ToGlslBoolean) => GlslBoolean;
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
} & {
    new (origin: GlslExpression): GlslBoolean;
};
