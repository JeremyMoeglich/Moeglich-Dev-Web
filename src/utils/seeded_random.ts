export function seeded_rand(seed: number): () => number {
    let state = seed;
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;

    return (): number => {
        state = (a * state + c) % m;
        return state / m;
    };
}
