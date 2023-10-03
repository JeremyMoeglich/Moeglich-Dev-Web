import { panic } from "functional-utilities";
import { lerp } from "./lerp";

export function linget(arr: number[], i: number): number {
    const lower =
        arr[Math.floor(i)] ??
        panic(`Index ${i} out of bounds for array of length ${arr.length}`);
    const upper =
        arr[Math.ceil(i)] ??
        panic(`Index ${i} out of bounds for array of length ${arr.length}`);
    const t = i - Math.floor(i);
    return lerp(lower, upper, t);
}
