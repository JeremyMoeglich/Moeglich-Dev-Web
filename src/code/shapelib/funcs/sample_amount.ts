export function sample_amount_default(
    size: number,
    avr_per_unit: number,
    variant: "min" | "rng",
): number {
    const flt_amount = size * avr_per_unit;
    const min_points = Math.floor(flt_amount);
    const remaining = flt_amount - min_points;
    const add_point =
        variant === "min" ? remaining > 0 : Math.random() < remaining;
    const amount = min_points + (add_point ? 1 : 0);

    return amount;
}
