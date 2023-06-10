import type { Bundler } from "~/code/bundle";

export interface Id {
    id(): string; // Unique identifier, only changes when the object changes
}

export function is_Id(value: unknown): value is Id {
    return (value as Id).id !== undefined;
}

export const id_bundler: Bundler<Id, Id> = {
    isType: is_Id,
    functionality: {
        id: (objects) => {
            return objects.map((o) => o.id()).join(", ");
        },
    },
};
