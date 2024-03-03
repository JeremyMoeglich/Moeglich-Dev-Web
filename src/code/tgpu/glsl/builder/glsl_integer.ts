import type { GlslExpression } from "..";
import type { GlslBoolean } from "./glsl_boolean";
import { makeGlslInteger, wrap_int } from "./literals";
import {
    type Trackable,
    arithmetic_proto,
    build_proto,
    relation_proto,
    equality_proto,
    is_trackable,
} from "./proto";

export type ToGlslInteger = number | GlslInteger;
const GlslIntegerProto = build_proto([
    equality_proto(makeGlslInteger),
    relation_proto(makeGlslInteger),
    arithmetic_proto(makeGlslInteger, wrap_int),
]);
export const GlslInteger = function (
    this: GlslInteger,
    value: GlslExpression | ToGlslInteger,
) {
    if (is_trackable(value, "int")) {
        this.origin = value.origin;
    } else if (typeof value === "number") {
        this.origin = {
            type: "literal",
            value: value,
            literal_type: "integer",
        };
    } else {
        this.origin = value;
    }
    this.glsl_name = "int";
} as unknown as new (
    value: GlslExpression | ToGlslInteger,
) => GlslInteger;
Object.assign(GlslInteger.prototype, GlslIntegerProto);
export type GlslInteger = Trackable<"int"> & {
    eq: (other: GlslInteger | number) => GlslBoolean;
    ne: (other: GlslInteger | number) => GlslBoolean;
    lt: (other: GlslInteger | number) => GlslBoolean;
    le: (other: GlslInteger | number) => GlslBoolean;
    gt: (other: GlslInteger | number) => GlslBoolean;
    ge: (other: GlslInteger | number) => GlslBoolean;

    add: (other: GlslInteger | number) => GlslInteger;
    sub: (other: GlslInteger | number) => GlslInteger;
    mul: (other: GlslInteger | number) => GlslInteger;
    div: (other: GlslInteger | number) => GlslInteger;
    neg: () => GlslInteger;
} & {
    new (origin: GlslExpression): GlslInteger;
};
