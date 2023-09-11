import { NonEmptyArray } from "@trpc/client/dist/internals/types";
import {
    map_entries,
    map_values,
    panic,
    typed_entries,
    zip,
} from "functional-utilities";
import { isArray } from "lodash-es";
import { Interpolate, interpolate_bundler } from "~/code/funcs/interpolator";

interface NestedNumbers {
    [key: string]: number | NestedNumbers | (number | NestedNumbers)[];
}

function interpolate_two<
    T extends Interpolate | NestedNumbers | number | number[] | NestedNumbers[]
>(start: T, end: T, t: number): T {
    if (interpolate_bundler.isType(start) && interpolate_bundler.isType(end)) {
        return start.interpolate(t, end) as unknown as T;
    } else if (isArray(start) && isArray(end)) {
        return zip([start, end] as [number[], number[]]).map(([start, end]) =>
            interpolate_two(start, end, t)
        ) as unknown as T;
    } else if (typeof start === "number" && typeof end === "number") {
        return (start + (end - start) * t) as T;
    } else if (
        typeof start === "object" &&
        typeof end === "object" &&
        !isArray(start) &&
        !isArray(end)
    ) {
        return Object.fromEntries(
            Object.entries(start).map(([key, value]) => [
                key,
                interpolate_two(value, (end as NestedNumbers)[key], t),
            ])
        ) as unknown as T;
    } else {
        throw new Error("Invalid interpolation");
    }
}


export function interpolate<T extends Interpolate | NestedNumbers | number>(
    values: NonEmptyArray<{
        value: T;
        duration: number;
    }>,
    t: number
): T {
    let current = 0;
    let remaining_duration = t;
    for (let i = 0; i < values.length; i++) {
        const value = values[i] ?? panic();
        if (value.duration <= remaining_duration) {
            remaining_duration -= value.duration;
            current++;
        } else {
            break;
        }
    }
    if (current == values.length) {
        return values.at(-1)?.value ?? panic();
    }

    const i1 = values[current] ?? panic();
    const i2 = values[current + 1] ?? i1;
    const i3 = values[current + 2] ?? i2;
    const i4 = values[current + 3] ?? i3;

    const inter1_d1 = interpolate_two(i1.value, i2.value, remaining_duration / i1.duration);
    const inter2_d1 = interpolate_two(i2.value, i3.value, remaining_duration / i1.duration);
    const inter1_d2 = interpolate_two(i2.value, i3.value, remaining_duration / i1.duration);
    const inter2_d2 = interpolate_two(i3.value, i4.value, remaining_duration / i1.duration);

    const inter1 = interpolate_two(inter1_d1, inter2_d1, remaining_duration / i1.duration);
    const inter2 = interpolate_two(inter1_d2, inter2_d2, remaining_duration / i1.duration);

    return interpolate_two(inter1, inter2, remaining_duration / i1.duration);
}
