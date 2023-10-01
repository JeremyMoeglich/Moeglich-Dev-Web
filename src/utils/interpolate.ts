import { NonEmptyArray } from "@trpc/client/dist/internals/types";
import {
    map_entries,
    map_values,
    panic,
    typed_entries,
    zip,
} from "functional-utilities";
import { isArray, sumBy } from "lodash-es";
import { Interpolate, interpolate_bundler } from "~/code/funcs/interpolator";

interface NestedNumbers {
    [key: string]: number | NestedNumbers | (number | NestedNumbers)[];
}

function lerp(a: number, b: number, t: number, d: number): number {
    return a + (b - a) * (t / d);
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


// Cubic Bezier function for easing
function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    return (uu * u * p0) + (3 * uu * t * p1) + (3 * u * tt * p2) + (tt * t * p3);
}
// Helper function to calculate control points
function calcControlPoints(a: number, b: number, c: number, d: number): [number, number] {
    const control1 = b + (c - a) / 3;
    const control2 = c - (d - b) / 3;
    return [control1, control2];
  }
  
  // Helper function to interpolate NestedNumbers with automatically calculated cubic Bezier control points
  function interpolateNestedAuto(a: NestedNumbers, b: NestedNumbers, c: NestedNumbers, d: NestedNumbers, t: number): NestedNumbers {
    const result: NestedNumbers = {};
    for (const key in b) {
      if (typeof a[key] === 'number' && typeof b[key] === 'number' && typeof c[key] === 'number' && typeof d[key] === 'number') {
        const [control1, control2] = calcControlPoints(a[key] as number, b[key] as number, c[key] as number, d[key] as number);
        result[key] = cubicBezier(t, b[key] as number, control1, control2, c[key] as number);
      } else if (typeof a[key] === 'object' && typeof b[key] === 'object' && typeof c[key] === 'object' && typeof d[key] === 'object') {
        result[key] = interpolateNestedAuto(a[key] as NestedNumbers, b[key] as NestedNumbers, c[key] as NestedNumbers, d[key] as NestedNumbers, t);
      }
    }
    return result;
  }
  
  export function interpolate<T extends NestedNumbers | number>(
    values: NonEmptyArray<{
      value: T;
      duration: number;
    }>,
    t: number
  ): T {
    let currentTime = 0;
    for (let i = 1; i < values.length - 1; i++) {  // Starting from 1 and ending before last to have neighbors for all
      const a = values[i - 1].value;
      const b = values[i].value;
      const c = values[i + 1].value;
      const d = values[i + 2]?.value || c;  // If 'd' doesn't exist, use 'c' as a fallback
      const duration = values[i].duration;
  
      if (t >= currentTime && t <= currentTime + duration) {
        const normalizedT = (t - currentTime) / duration;
        if (typeof a === 'number' && typeof b === 'number' && typeof c === 'number' && typeof d === 'number') {
          const [control1, control2] = calcControlPoints(a, b, c, d);
          return cubicBezier(normalizedT, b, control1, control2, c) as T;
        } else if (typeof a === 'object' && typeof b === 'object' && typeof c === 'object' && typeof d === 'object') {
          return interpolateNestedAuto(a as NestedNumbers, b as NestedNumbers, c as NestedNumbers, d as NestedNumbers, normalizedT) as T;
        }
      }
  
      currentTime += duration;
    }
    // Fallback
    return values[values.length - 1].value;
  }