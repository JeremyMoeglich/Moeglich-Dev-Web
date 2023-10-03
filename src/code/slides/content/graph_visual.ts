import { range } from "functional-utilities";
import { Point } from "~/code/shapelib";

function hashNumber(
    n: number,
    lower_bound: number,
    upper_bound: number
): number {
    const seed = 0x1234abcd; // Fixed seed to ensure deterministic output
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    const r1 = 15;
    const r2 = 13;
    const m = 5;
    const constN = 0xe6546b64;

    let hash = seed;
    let k = n;

    k = k * c1;
    k = (k << r1) | (k >>> (32 - r1)); // Logical shift
    k = k * c2;

    hash = hash ^ k;
    hash = ((hash << r2) | (hash >>> (32 - r2))) * m + constN;

    hash = hash ^ (hash >>> 16);
    hash = hash * 0x85ebca6b;
    hash = hash ^ (hash >>> 13);
    hash = hash * 0xc2b2ae35;
    hash = hash ^ (hash >>> 16);

    const range = upper_bound - lower_bound + 1;
    return lower_bound + ((hash >>> 0) % range); // `>>> 0` is to ensure we have a non-negative value
}

function get_influence(t: number): number {
    if (t < 0) {
        return 0;
    }
    return (t / 10) * Math.exp(-((t / 10 - 1) ** 2));
}

function generate_point(seed: number, t: number) {
    const start_sample = Math.floor(t / 10000) * 10000;
    const samples = range(0, 20).map((i) => {
        const sample = start_sample + i * 10; // samples are 10 seconds apart
        const point = new Point(
            hashNumber(sample + seed, 0, 1000),
            hashNumber(-sample + seed, 0, 1000)
        );
        const t_offset = t - sample; // Adjusted to be in the same unit
        const influence = get_influence(t_offset / 1000);
        return [point, influence] as [Point, number];
    });

    const total_influence = samples.reduce(
        (acc, [_, influence]) => acc + influence,
        0
    );
    return samples
        .map(([point, influence]) => {
            return [point, influence / total_influence] as [Point, number];
        })
        .reduce((acc, [point, influence]) => {
            return acc.translate(point.multiply(influence));
        }, new Point(0, 0));
}

export function rand_points(t: number) {
    return range(0, 20).map((i) => {
        const p = generate_point(i, t);
        return p;
    });
}
