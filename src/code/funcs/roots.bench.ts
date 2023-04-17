import { bench, describe } from "vitest";
import { find_roots_linear as r2_1, find_roots_quadratic as r3_1, find_roots_cubic as r4_1, find_roots_quartic as r5_1 } from "./roots_old";
import { find_roots_linear as r2_2, find_roots_quadratic as r3_2, find_roots_cubic as r4_2, find_roots_quartic as r5_2 } from "./roots";

const iterations = 1000;
describe('roots linear', () => {
    bench('old', () => {
        r2_1(1, 2);
    }, { iterations });

    bench('new', () => {
        r2_2(1, 2);
    }, { iterations });
});

describe('roots quadratic', () => {
    bench('old', () => {
        r3_1(1, 2, 3);
    }, { iterations });

    bench('new', () => {
        r3_2(1, 2, 3);
    }, { iterations });
});

describe('roots cubic', () => {
    bench('old', () => {
        r4_1(1, 2, 3, 4);
    }, { iterations });

    bench('new', () => {
        r4_2(1, 2, 3, 4);
    }, { iterations });
});

describe('roots quartic', () => {
    bench('old', () => {
        r5_1(1, 2, 3, 4, 5);
    }, { iterations });

    bench('new', () => {
        r5_2(1, 2, 3, 4, 5);
    }, { iterations });
});