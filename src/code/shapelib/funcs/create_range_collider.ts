import IntervalTree from "node-interval-tree";

type SegmentRange = [number, number];

export function create_range_collider<T, Q>(
    elements: T[],
    t_range: (t: T) => SegmentRange,
    q_range: (q: Q) => SegmentRange,
    t_filter?: (t: T, q: Q) => boolean,
): (query: Q) => T[] {
    const tree = new IntervalTree<T>();
    for (const t of elements) {
        const [start, end] = t_range(t);
        tree.insert(start, end, t);
    }

    return ((query: Q) => {
        const [start, end] = q_range(query);
        const potential_results = tree.search(start, end);
        return potential_results.filter((t) =>
            (t_filter ?? (() => true))(t, query),
        );
    }) as (query: Q) => T[];
}
