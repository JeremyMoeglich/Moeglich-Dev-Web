import { panic } from "functional-utilities";

export function find_roots_cubic(
    a3: number,
    a2: number,
    a1: number,
    a0: number,
): number[] {
    // Handle non-standard cases
    if (a3 === 0) {
        // a3 = 0; a2*x^2+a1*x+a0=0; solve quadratic equation
        return find_roots_quadratic(a2, a1, a0);
    } else if (a2 === 0) {
        // a2 = 0; a3*x^3+a1*x+a0=0; solve depressed cubic equation
        return find_roots_cubic_depressed(a1 / a3, a0 / a3);
    } else if (a3 === 1) {
        // solve normalized cubic expression
        return find_roots_cubic_normalized(a2, a1, a0);
    } else {
        // standard case
        const d =
            18 * a3 * a2 * a1 * a0 -
            4 * a2 * a2 * a2 * a0 +
            a2 * a2 * a1 * a1 -
            4 * a3 * a1 * a1 * a1 -
            27 * a3 * a3 * a0 * a0;
        const d0 = a2 * a2 - 3 * a3 * a1;
        const d1 = 2 * a2 * a2 * a2 - 9 * a3 * a2 * a1 + 27 * a3 * a3 * a0;
        if (d < 0) {
            // one real root
            const sqrt = Math.sqrt(-27 * a3 * a3 * d);
            const c_base = (d1 < 0 ? d1 - sqrt : d1 + sqrt) / 2;
            const c = Math.cbrt(c_base);
            const x = -(a2 + c + d0 / c) / (3 * a3);
            return [x];
        } else if (d === 0) {
            // multiple roots
            if (d0 === 0) {
                // triple root
                return [-a2 / (a3 * 3)];
            } else {
                // single root and double root
                return [
                    (9 * a3 * a0 - a2 * a1) / (d0 * 2),
                    (4 * a3 * a2 * a1 - 9 * a3 * a3 * a0 - a2 * a2 * a2) /
                        (a3 * d0),
                ];
            }
        } else {
            // three real roots
            const c3_img = Math.sqrt(27 * a3 * a3 * d) / 2;
            const c3_real = d1 / 2;
            const c3_module = Math.sqrt(c3_img * c3_img + c3_real * c3_real);
            const c3_phase = 2 * Math.atan(c3_img / (c3_real + c3_module));
            const c_module = Math.cbrt(c3_module);
            const c_phase = c3_phase / 3;
            const c_real = c_module * Math.cos(c_phase);
            const c_img = c_module * Math.sin(c_phase);
            const x0_real =
                -(a2 + c_real + (d0 * c_real) / (c_module * c_module)) /
                (3 * a3);

            const e_real = -1 / 2;
            const e_img = Math.sqrt(3) / 2;
            const c1_real = c_real * e_real - c_img * e_img;
            const c1_img = c_real * e_img + c_img * e_real;
            const x1_real =
                -(
                    a2 +
                    c1_real +
                    (d0 * c1_real) / (c1_real * c1_real + c1_img * c1_img)
                ) /
                (3 * a3);

            const c2_real = c1_real * e_real - c1_img * e_img;
            const c2_img = c1_real * e_img + c1_img * e_real;
            const x2_real =
                -(
                    a2 +
                    c2_real +
                    (d0 * c2_real) / (c2_real * c2_real + c2_img * c2_img)
                ) /
                (3 * a3);

            return [x0_real, x1_real, x2_real];
        }
    }
}

export function find_roots_quadratic(
    a2: number,
    a1: number,
    a0: number,
): number[] {
    // Handle non-standard cases
    if (a2 === 0) {
        // a2 = 0; a1*x+a0=0; solve linear equation
        return ((v) => (v ? [v] : []))(find_roots_linear(a1, a0));
    } else {
        const discriminant = a1 * a1 - 4 * a2 * a0;
        if (discriminant < 0) {
            return [];
        } else {
            const a2x2 = 2 * a2;
            if (discriminant === 0) {
                return [-a1 / a2x2];
            } else {
                // To improve precision, do not use the smallest divisor.
                // See https://people.csail.mit.edu/bkph/articles/Quadratics.pdf
                const sq = Math.sqrt(discriminant);

                const [same_sign, diff_sign] =
                    a1 < 0 ? [-a1 + sq, -a1 - sq] : [-a1 - sq, -a1 + sq];

                const [x1, x2] =
                    Math.abs(same_sign) > Math.abs(a2x2)
                        ? Math.abs(diff_sign) > Math.abs(a2x2)
                            ? [(a0 * 2) / same_sign, (a0 * 2) / diff_sign]
                            : [(a0 * 2) / same_sign, same_sign / a2x2]
                        : [diff_sign / a2x2, same_sign / a2x2];

                // Order roots
                return x1 < x2 ? [x1, x2] : [x2, x1];
            }
        }
    }
}

export function find_roots_linear(a1: number, a0: number): number | undefined {
    if (a1 === 0) {
        if (a0 === 0) {
            return 0;
        } else {
            return undefined;
        }
    } else {
        return -a0 / a1;
    }
}

function find_roots_cubic_depressed(a1: number, a0: number): number[] {
    if (a1 === 0) {
        return [-Math.cbrt(a0)];
    } else if (a0 === 0) {
        const quadraticRoots = find_roots_quadratic(1, 0, a1);
        quadraticRoots.push(0);
        return quadraticRoots;
    } else {
        const d = (a0 * a0) / 4 + (a1 * a1 * a1) / 27;
        if (d < 0) {
            const a = Math.sqrt((-4 * a1) / 3);

            const phi = Math.acos((-4 * a0) / (a * a * a)) / 3;
            const x1 = a * Math.cos(phi);
            const x2 = a * Math.cos(phi + (2 / 3) * Math.PI);
            const x3 = a * Math.cos(phi - (2 / 3) * Math.PI);
            return [x1, x2, x3];
        } else {
            const sqrt_d = Math.sqrt(d);
            const a0_div_2 = a0 / 2;
            const x1 =
                Math.cbrt(sqrt_d - a0_div_2) - Math.cbrt(sqrt_d + a0_div_2);
            if (d === 0) {
                const quadraticRoots = find_roots_quadratic(1, 0, a1);
                quadraticRoots.push(a0_div_2);
                return quadraticRoots;
            } else {
                return [x1];
            }
        }
    }
}

function find_roots_cubic_normalized(
    a2: number,
    a1: number,
    a0: number,
): number[] {
    const q = (3 * a1 - a2 ** 2) / 9;
    const r = (9 * a2 * a1 - 27 * a0 - 2 * a2 ** 3) / 54;
    const q3 = q ** 3;
    const d = q3 + r ** 2;
    const a2_div_3 = a2 / 3;

    if (d < 0) {
        const phi_3 = Math.acos(r / (-q3) ** 0.5) / 3;
        const sqrt_q_2 = 2 * (-q) ** 0.5;

        return [
            sqrt_q_2 * Math.cos(phi_3) - a2_div_3,
            sqrt_q_2 * Math.cos(phi_3 - (2 / 3) * Math.PI) - a2_div_3,
            sqrt_q_2 * Math.cos(phi_3 + (2 / 3) * Math.PI) - a2_div_3,
        ];
    } else {
        const sqrt_d = Math.sqrt(d);
        const s = Math.cbrt(r + sqrt_d);
        const t = Math.cbrt(r - sqrt_d);

        if (s === t) {
            if (s + t === 0) {
                return [s + t - a2_div_3];
            } else {
                return [s + t - a2_div_3, -((s + t) / 2) - a2_div_3];
            }
        } else {
            return [s + t - a2_div_3];
        }
    }
}

function find_roots_biquadratic(a4: number, a2: number, a0: number): number[] {
    if (a4 === 0) {
        return find_roots_quadratic(a2, 0, a0);
    } else if (a0 === 0) {
        const roots = find_roots_quadratic(a4, 0, a2);
        roots.push(0);
        return roots;
    } else {
        const roots = [];
        for (const x of find_roots_quadratic(a4, a2, a0)) {
            if (x > 0) {
                const sqrt_root = Math.sqrt(x);
                roots.push(sqrt_root);
                roots.push(-sqrt_root);
            } else if (x === 0) {
                roots.push(0);
            }
        }
        return roots;
    }
}

export function find_roots_quartic(
    a4: number,
    a3: number,
    a2: number,
    a1: number,
    a0: number,
): number[] {
    if (a4 === 0) {
        return find_roots_cubic(a3, a2, a1, a0);
    } else if (a0 === 0) {
        return find_roots_cubic(a4, a3, a2, a1).concat([0]);
    } else if (a1 === 0 && a3 === 0) {
        return find_roots_biquadratic(a4, a2, a0);
    } else {
        // Discriminant
        // https://en.wikipedia.org/wiki/Quartic_function#Nature_of_the_roots
        // Partially simplifed to keep intermediate values smaller (to minimize rounding errors).
        const discriminant =
            a4 *
                a0 *
                a4 *
                (256 * a4 * a0 * a0 + a1 * (144 * a2 * a1 - 192 * a3 * a0)) +
            a4 * a0 * a2 * a2 * (16 * a2 * a2 - 80 * a3 * a1 - 128 * a4 * a0) +
            a3 *
                a3 *
                (a4 * a0 * (144 * a2 * a0 - 6 * a1 * a1) +
                    (a0 *
                        (18 * a3 * a2 * a1 -
                            27 * a3 * a3 * a0 -
                            4 * a2 * a2 * a2) +
                        a1 * a1 * (a2 * a2 - 4 * a3 * a1))) +
            a4 *
                a1 *
                a1 *
                (18 * a3 * a2 * a1 - 27 * a4 * a1 * a1 - 4 * a2 * a2 * a2);
        const pp = 8 * a4 * a2 - 3 * a3 * a3;
        const rr = a3 * a3 * a3 + 8 * a4 * a4 * a1 - 4 * a4 * a3 * a2;
        const delta0 = a2 * a2 - 3 * a3 * a1 + 12 * a4 * a0;
        const dd =
            64 * a4 * a4 * a4 * a0 -
            16 * a4 * a4 * a2 * a2 +
            16 * a4 * a3 * a3 * a2 -
            16 * a4 * a4 * a3 * a1 -
            3 * a3 * a3 * a3 * a3;

        // Handle special cases
        const double_root = discriminant === 0;
        if (double_root) {
            const triple_root = double_root && delta0 === 0;
            const quadruple_root = triple_root && dd === 0;
            const no_roots = dd === 0 && pp > 0 && rr === 0;
            if (quadruple_root) {
                // Wiki: all four roots are equal
                return [-a3 / (4 * a4)];
            } else if (triple_root) {
                // Wiki: At least three roots are equal to each other
                // x0 is the unique root of the remainder of the Euclidean division of the quartic by its second derivative
                //
                // Solved by SymPy (ra is the desired reminder)
                // a, b, c, d, e = symbols('a,b,c,d,e')
                // f=a*x**4+b*x**3+c*x**2+d*x+e     // Quartic polynom
                // g=6*a*x**2+3*b*x+c               // Second derivative
                // q, r = div(f, g)                 // SymPy only finds the highest power
                // simplify(f-(q*g+r)) == 0         // Verify the first division
                // qa, ra = div(r/a,g/a)            // Workaround to get the second division
                // simplify(f-((q+qa)*g+ra*a)) == 0 // Verify the second division
                // solve(ra,x)
                // ----- yields
                // (−72*a^2*e+10*a*c^2−3*b^2*c)/(9*(8*a^2*d−4*a*b*c+b^3))
                const x0 =
                    (-72 * a4 * a4 * a0 +
                        10 * a4 * a2 * a2 -
                        3 * a3 * a3 * a2) /
                    (9 * (8 * a4 * a4 * a1 - 4 * a4 * a3 * a2 + a3 * a3 * a3));
                return [x0, -(a3 / a4 + 3 * x0)];
            } else if (no_roots) {
                // Wiki: two complex conjugate double roots
                return [];
            } else {
                return find_roots_via_depressed_quartic(
                    a4,
                    a3,
                    a2,
                    a1,
                    a0,
                    pp,
                    rr,
                    dd,
                );
            }
        } else {
            const no_roots = discriminant > 0 && (pp > 0 || dd > 0);
            if (no_roots) {
                return [];
            } else {
                return find_roots_via_depressed_quartic(
                    a4,
                    a3,
                    a2,
                    a1,
                    a0,
                    pp,
                    rr,
                    dd,
                );
            }
        }
    }
}

function find_roots_via_depressed_quartic(
    a4: number,
    a3: number,
    a2: number,
    a1: number,
    a0: number,
    pp: number,
    rr: number,
    dd: number,
): number[] {
    const a4_pow_2 = a4 * a4;
    const a4_pow_3 = a4_pow_2 * a4;
    const a4_pow_4 = a4_pow_3 * a4;
    // Re-use pre-calculated values
    const p = pp / (a4_pow_2 * 8);
    const q = rr / (a4_pow_3 * 8);
    const r =
        (dd + 16 * a4_pow_2 * (12 * a0 * a4 - 3 * a1 * a3 + a2 * a2)) /
        (256 * a4_pow_4);

    return find_roots_quartic_depressed(p, q, r).map((y) => y - a3 / (4 * a4));
}

function find_roots_quartic_depressed(
    a2: number,
    a1: number,
    a0: number,
): number[] {
    if (a1 === 0) {
        return find_roots_biquadratic(1, a2, a0);
    } else if (a0 === 0) {
        return find_roots_cubic_normalized(0, a2, a1);
    } else {
        const a2_pow_2 = a2 * a2;
        const a1_div_2 = a1 / 2;
        const b2 = (a2 * 5) / 2;
        const b1 = 2 * a2_pow_2 - a0;
        const b0 = (a2_pow_2 * a2 - a2 * a0 - a1_div_2 * a1_div_2) / 2;

        const resolvent_roots = find_roots_cubic_normalized(b2, b1, b0);
        const y = resolvent_roots.at(-1) ?? panic("No resolvent root found");

        const a2_plus_2y = a2 + 2 * y;
        if (a2_plus_2y > 0) {
            const sqrt_a2_plus_2y = Math.sqrt(a2_plus_2y);
            const q0a = a2 + y - a1_div_2 / sqrt_a2_plus_2y;
            const q0b = a2 + y + a1_div_2 / sqrt_a2_plus_2y;

            const roots = find_roots_quadratic(1, sqrt_a2_plus_2y, q0a);
            roots.push(...find_roots_quadratic(1, -sqrt_a2_plus_2y, q0b));
            return roots;
        } else {
            return [];
        }
    }
}
