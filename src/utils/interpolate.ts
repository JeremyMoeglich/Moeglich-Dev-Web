import { NonEmptyArray } from "@trpc/client/dist/internals/types";
import { map_entries, map_values, panic, zip } from "functional-utilities";
import { isArray } from "lodash-es";
import { Interpolate, interpolate_bundler } from "~/code/funcs/interpolator";

interface NestedNumbers {
    [key: string]: number | NestedNumbers | (number | NestedNumbers)[];
}

function interpolate_two<
    T extends Interpolate | NestedNumbers | number | number[] | NestedNumbers[]
>(start: T, end: T, t: number): T {
    if (interpolate_bundler.isType(start)) {
        return start.interpolate(t, end as typeof start) as unknown as T;
    } else if (typeof start === "number") {
        return lerp(start, end as typeof start, t) as T;
    } else if (isArray(start)) {
        return zip([start as NestedNumbers[], end as NestedNumbers[]]).map(
            ([s, e]) => interpolate_two(s, e, t)
        ) as T;
    } else {
        return map_entries(start as Record<string, NestedNumbers>, ([k, v]) =>
            interpolate_two(v, end[k], t)
        ) as unknown as T;
    }
}

export function interpolate<T extends Interpolate | NestedNumbers | number>(
    values: NonEmptyArray<{
        value: T;
        duration: number;
    }>,
    t: number
): T {
    let end_index = 0;
    let remaining_duration = t;
    let break_early = false;
    for (const entry of values) {
        if (entry.duration <= t) {
            remaining_duration - entry.duration;
            end_index += 1;
        } else {
            break_early = true;
            break;
        }
    }
    if (break_early) {
        return (values.at(-1) ?? panic()).value;
    }
    if (end_index === 0) {
        return values[0].value;
    }
    const start_index = end_index - 1;
    const start = values[start_index] ?? panic();
    const end = values[end_index] ?? panic();
    return start.value.interpolate(
        remaining_duration / start.duration,
        end.value
    );
}
