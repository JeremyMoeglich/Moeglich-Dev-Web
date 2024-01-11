/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SHA256 } from "crypto-js";
import { BuildScope } from "./scope";
import type { GlslBuilder } from "./to_builder";
import { extract_common_expressions, take_unique_var } from "../extract_common";
import { infer_glsl_type } from "../infer_type";
import { GlslVariableReference } from "..";

const keys = [
    "set",
    "add_set",
    "sub_set",
    "mul_set",
    "div_set",
    "get",
    "value",
] as const;

export const GlslVariable = function <T extends GlslBuilder>(
    this: GlslVariable<T>,
    value: T & { origin: GlslVariableReference },
    scope: BuildScope,
) {
    this.value = Object.assign(
        Object.create(Object.getPrototypeOf(value)),
        value,
    );
    return new Proxy(this, {
        get: (target, prop) => {
            if (prop === "set") {
                return (other: T) => {
                    const extracted = extract_common_expressions(
                        scope.vars,
                        other.origin,
                    );
                    scope.statements.push(...extracted.statements);
                    scope.statements.push({
                        type: "variable_assign",
                        name: target.value.origin.name,
                        operator: "=",
                        value: extracted.output_expr,
                    });
                };
            } else if (prop === "add_set") {
                return (other: T) => {
                    const extracted = extract_common_expressions(
                        scope.vars,
                        other.origin,
                    );
                    scope.statements.push(...extracted.statements);
                    scope.statements.push({
                        type: "variable_assign",
                        name: target.value.origin.name,
                        operator: "+=",
                        value: extracted.output_expr,
                    });
                };
            } else if (prop === "sub_set") {
                return (other: T) => {
                    const extracted = extract_common_expressions(
                        scope.vars,
                        other.origin,
                    );
                    scope.statements.push(...extracted.statements);
                    scope.statements.push({
                        type: "variable_assign",
                        name: target.value.origin.name,
                        operator: "-=",
                        value: extracted.output_expr,
                    });
                };
            } else if (prop === "div_set") {
                return (other: T) => {
                    const extracted = extract_common_expressions(
                        scope.vars,
                        other.origin,
                    );
                    scope.statements.push(...extracted.statements);
                    scope.statements.push({
                        type: "variable_assign",
                        name: target.value.origin.name,
                        operator: "/=",
                        value: extracted.output_expr,
                    });
                };
            } else if (prop === "mul_set") {
                return (other: T) => {
                    const extracted = extract_common_expressions(
                        scope.vars,
                        other.origin,
                    );
                    scope.statements.push(...extracted.statements);
                    scope.statements.push({
                        type: "variable_assign",
                        name: target.value.origin.name,
                        operator: "*=",
                        value: extracted.output_expr,
                    });
                };
            } else if (prop === "get") {
                return () => target.value;
            } else {
                const v = target.value[prop as keyof T];
                return v;
            }
        },
        set: (target, prop, value) => {
            target.value[prop as keyof T] = value;
            return true;
        },
        has: (target, prop) => {
            return (
                keys.includes(prop as (typeof keys)[number]) ||
                prop in target.value
            );
        },
        deleteProperty: (target, prop) => {
            delete target.value[prop as keyof T];
            return true;
        },
        ownKeys: (target) => {
            return [...keys, ...Object.keys(target.value)];
        },
    });
} as unknown as {
    new <T extends GlslBuilder>(value: T, scope: BuildScope): GlslVariable<T>;
};
export type GlslVariable<T extends GlslBuilder> = T & {
    set: (other: T) => void;
    add_set: (other: T) => void;
    sub_set: (other: T) => void;
    mul_set: (other: T) => void;
    div_set: (other: T) => void;
    get: () => T;
    value: T & { origin: GlslVariableReference };
} & {
    new (value: T, scope: BuildScope): GlslVariable<T>;
};
