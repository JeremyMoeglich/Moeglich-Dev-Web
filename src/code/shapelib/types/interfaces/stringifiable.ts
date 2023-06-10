import type { Bundler } from "../../../bundle";

export interface Stringifiable {
    toString(): string;
}

export function is_Stringifiable(value: unknown): value is Stringifiable {
    return (value as Stringifiable).toString !== undefined;
}

export const stringifiable_bundler: Bundler<Stringifiable, Stringifiable> = {
    isType: is_Stringifiable,
    functionality: {
        toString: (objects) => {
            return objects.map((o) => o.toString()).join(", ");
        },
    },
};
