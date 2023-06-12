export function interpolate_between(t: number, a: number, b: number) {
    const range = b - a;
    const phase = (Math.sin(t * Math.PI) + 1) / 2;
    return a + range * phase;
}