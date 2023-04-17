import { test, expect } from 'vitest';
import { edge_random } from './test_utils';
import { find_roots_cubic, find_roots_linear, find_roots_quadratic, find_roots_quartic } from './roots';

function validate_roots(params: number[], roots: number[]) {
    // params are in the form [a, b, c, d, e] where a*x^4 + b*x^3 + c*x^2 + d*x + e = 0
    // the amount of params may vary

    const f = (x: number) => {
        let y = 0;
        for (const [i, a] of params.entries()) {
            y += a * x ** (params.length - i - 1);
        }
        return y;
    }

    for (const root of roots) {
        expect(
            f(root),
            `root ${root} is not a root of ${params.map((p, i) => {
                const sign = p > 0 ? '+' : '-';
                return ` ${sign} ${Math.abs(p)}x^${params.length - i - 1}`;
            }).join('')}. The amount of roots is ${roots.length}`
        ).toBeCloseTo(0, -1);
    }
}

const amount = 1000000;

test('find_linear_roots', () => {
    for (let i = 0; i < amount; i++) {
        const a = edge_random();
        const b = edge_random();
        const roots = find_roots_linear(a, b);
        validate_roots([a, b], roots);
    }
});

test('find_quadratic_roots', () => {
    for (let i = 0; i < amount; i++) {
        const a = edge_random();
        const b = edge_random();
        const c = edge_random();
        const roots = find_roots_quadratic(a, b, c);
        validate_roots([a, b, c], roots);
    }
});

test('find_cubic_roots', () => {
    for (let i = 0; i < amount; i++) {
        const a = edge_random();
        const b = edge_random();
        const c = edge_random();
        const d = edge_random();
        const roots = find_roots_cubic(a, b, c, d);
        validate_roots([a, b, c, d], roots);
    }
});

test('find_quartic_roots', () => {
    for (let i = 0; i < amount; i++) {
        const a = edge_random();
        const b = edge_random();
        const c = edge_random();
        const d = edge_random();
        const e = edge_random();
        const roots = find_roots_quartic(a, b, c, d, e);
        validate_roots([a, b, c, d, e], roots);
    }
});

