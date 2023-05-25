export function quality_to_amount_per_unit(quality: number): number {
    return 2 ** (quality - 1) / 100;
}
