import type { Bundler } from "../../../bundle";

export interface Stringifiable {
    to_string(): string;
}

export function is_Stringifiable(value: unknown): value is Stringifiable {
    return (value as Stringifiable).to_string !== undefined;
}

export const stringifiable_bundler: Bundler<Stringifiable, Stringifiable> = {
    isType: is_Stringifiable,
    functionality: {
        to_string: (objects) => {
            return objects.map((o) => o.to_string()).join(", ");
        },
    },
};
