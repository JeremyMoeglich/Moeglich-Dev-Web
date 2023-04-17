import { allRoots } from 'flo-poly';

const get_roots = (lst: number[]) => {
    const roots = allRoots(lst);
    if (lst.at(-1) === 0) {
        roots.push(0);
    }
    return roots.sort().reduce((acc, x) => {
        // Remove duplicates
        if (acc.length === 0 || acc.at(-1) !== x) {
            acc.push(x);
        }
        return acc;
    }, [] as number[]);
};

export const find_roots_linear = (a: number, b: number) => get_roots([a, b]);
export const find_roots_quadratic = (a: number, b: number, c: number) => get_roots([a, b, c]);
export const find_roots_cubic = (a: number, b: number, c: number, d: number) => get_roots([a, b, c, d]);
export const find_roots_quartic = (a: number, b: number, c: number, d: number, e: number) => get_roots([a, b, c, d, e]);