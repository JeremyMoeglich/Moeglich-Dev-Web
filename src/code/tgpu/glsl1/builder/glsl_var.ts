/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SHA256 } from "crypto-js";
import { BuildScope } from "./scope";
import type { GlslBuilder } from "./to_builder";
import { take_unique_var } from "../extract_common";
import { infer_glsl_type } from "../infer_type";

const keys = [
    "set", "add_set", "sub_set", "mul_set", "div_set", "get", "value",
] as const;

export const GlslVariable = function <T extends GlslBuilder>(
    this: GlslVariable<T>,
    value: T,
    scope: BuildScope,
) {
    this.value = Object.assign(
        Object.create(Object.getPrototypeOf(value)),
        value,
    );
    const hash = SHA256(
        JSON.stringify({
            i: scope.vars.size,
            v: value.origin,
        }),
    ).toString();
    const type = infer_glsl_type(scope.vars, value.origin);
    const name = take_unique_var(scope.vars, hash, type);
    scope.statements.push({
        type: "variable_declaration",
        name,
        invariant: false,
        initializer: value.origin,
        variable_type: type,
    });
    this.value.origin = {
        type: "variable",
        name,
    };
    return new Proxy(this, {
        get: (target, prop) => {
            if (prop === "set") {
                return (other: T) => {
                    scope.statements.push({
                        type: "variable_assign",
                        name,
                        operator: "=",
                        value: other.origin,
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
            return (keys).includes(prop as (typeof keys)[number]) || prop in target.value;
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
    value: T;
} & {
    new (value: T, scope: BuildScope): GlslVariable<T>;
};
