"use client";

import { makeNoise2D } from "fast-simplex-noise";
import { zip_longest } from "functional-utilities";
import { useEffect, useRef, useState } from "react";
import { useSimpleSpring } from "~/utils/spring";
import { useConstant } from "~/utils/use_persist";
import { useAnimationTime } from "~/utils/use_update";
import { Color } from "../../code/funcs/color";
import { seeded_rand } from "~/utils/seeded_random";
import Link from "next/link";

function Shift({
    parts,
    i,
    style,
    factor,
}: {
    parts: (string | undefined)[];
    i: number;
    style?: React.CSSProperties;
    factor: number;
}) {
    const parent_ref = useRef<null | HTMLSpanElement>(null);
    const [sizes, setSizes] = useState(
        parts.map((_) => ({ width: 0, height: 180 })),
    );
    const size_x = useSimpleSpring(sizes[i]?.width ?? 0, {
        damping: 26,
        stiffness: 170,
    });
    const size_y = sizes
        .map((s) => s.height)
        .reduce((prev, curr) => Math.max(prev, curr), 0);
    const smooth_i = useSimpleSpring(i);
    const max_size = sizes.reduce(
        (prev, curr) => ({
            width: Math.max(prev.width, curr.width),
            height: Math.max(prev.height, curr.height),
        }),
        { width: 0, height: 0 },
    );

    // biome-ignore lint/correctness/useExhaustiveDependencies: a change in parts will always cause a change in sizes
    useEffect(() => {
        const spans = parent_ref.current?.children;
        if (spans === undefined) {
            return;
        }

        const bounding_rects = Array.from(spans).map((span) =>
            span.getBoundingClientRect(),
        );

        const new_sizes = bounding_rects.map(({ width, height }) => ({
            width,
            height,
        }));

        setSizes(new_sizes);
    }, [parts]);

    return (
        <span
            style={{
                display: "inline-block",
                position: "relative",
                overflow: "hidden",
                width: size_x,
                height: size_y,
                fontSize: `${120 * factor}px`,
                fontWeight: "600",
                ...style,
            }}
            ref={parent_ref}
        >
            {parts.map((p, index) => {
                const offset = index - smooth_i;
                return (
                    <span
                        key={index}
                        style={{
                            position: "absolute",
                            transform: `translateX(
                                ${offset * max_size.width}px
                            )`,
                        }}
                    >
                        {p}
                    </span>
                );
            })}
        </span>
    );
}

// function Fit({
//     children,
//     style,
// }: {
//     children: React.ReactNode;
//     style?: React.CSSProperties;
// }) {
//     const child_ref = useRef<null | HTMLSpanElement>(null);
//     const self_ref = useRef<null | HTMLSpanElement>(null);
//     const [scale, setScale] = useState(1);

//     const child_size = useContainerSize(child_ref);
//     const self_size = useContainerSize(self_ref);

//     useEffect(() => {
//         if (child_size.x === 0 || child_size.y === 0) {
//             return;
//         }

//         const actual_self_size = {
//             width: self_size.x / scale,
//             height: self_size.y / scale,
//         };

//         const x_factor = actual_self_size.width / child_size.x;
//         const y_factor = actual_self_size.height / child_size.y;

//         const lower = Math.min(x_factor, y_factor);

//         setScale(lower);
//     }, [child_size, self_size]);

//     return (
//         <span ref={self_ref} style={style}>
//             <span
//                 ref={child_ref}
//                 style={{
//                     display: "inline-block",
//                     transform: `scale(${scale})`,
//                     transformOrigin: "top left",
//                 }}
//             >
//                 {children}
//             </span>
//         </span>
//     );
// }

function createInterpolator(
    data: Record<number, number>,
): (v: number) => number {
    // Convert the Record into a sorted array of [key, value] pairs (points)
    const sortedPoints = Object.entries(data)
        .map(([k, v]) => [Number(k), v] as [number, number])
        .sort((a, b) => a[0] - b[0]);

    if (sortedPoints.length === 0) {
        throw new Error("No data points provided");
    }

    if (sortedPoints.length === 1) {
        const [_, y] = sortedPoints[0]!;
        return () => y;
    }

    return (v: number): number => {
        if (v <= sortedPoints[0]![0]) return sortedPoints[0]![1];
        if (v >= sortedPoints[sortedPoints.length - 1]![0])
            return sortedPoints[sortedPoints.length - 1]![1];

        let low = 0;
        let high = sortedPoints.length - 1;

        // Perform binary search to find the right interval
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (sortedPoints[mid]![0] < v && sortedPoints[mid + 1]![0] > v) {
                const [x1, y1] = sortedPoints[mid]!;
                const [x2, y2] = sortedPoints[mid + 1]!;
                // Linear interpolation formula: y = y1 + (y2 - y1) * (v - x1) / (x2 - x1)
                return y1 + ((y2 - y1) * (v - x1)) / (x2 - x1);
            }
            if (sortedPoints[mid]![0] < v) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        // Fallback, should not be reached due to the initial range checks and binary search
        return 0;
    };
}

const animation_interpolator = createInterpolator({
    0: 0,
    932: 1,
});
const text_interpolator = createInterpolator({
    0: 0.4,
    932: 1,
});

export function TopAnimation() {
    const parent_ref = useRef<null | HTMLDivElement>(null);
    const [factors, setFactors] = useState({
        animation: 1,
        text: 1,
    });

    useEffect(() => {
        if (parent_ref.current === null) {
            return;
        }

        const updateWidth = () => {
            const width = parent_ref.current!.getBoundingClientRect().width;
            setFactors({
                animation: animation_interpolator(width),
                text: text_interpolator(width),
            });
        };

        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    const words = ["moeglich.dev", "Jeremy\nMoeglich"];

    const t = useAnimationTime();
    const i = Math.floor(t / 5000) % words.length;
    const cnoise = useConstant(makeNoise2D(seeded_rand(534)));
    const letter_parts = zip_longest(words.map((word) => word.split("")));

    return (
        <div className="flex justify-center" ref={parent_ref}>
            <div className="flex flex-col items-center w-fit">
                <div
                    className="relative flex flex-row justify-center w-[900px]"
                    style={{
                        filter: "drop-shadow(0px 0px 28px 0.6)",
                    }}
                >
                    {letter_parts.map((parts, index) => (
                        <Shift
                            key={index}
                            parts={parts}
                            i={i}
                            factor={factors.animation}
                            style={{
                                color: Color.fromHex("#ffffff")
                                    .interpolate(
                                        cnoise(
                                            index / 5 - t / 4000,
                                            t / 1000000,
                                        ),
                                        Color.fromHex("#917eff"),
                                    )
                                    .getHex(),
                            }}
                        />
                    ))}
                </div>
                <div
                    className="text-white"
                    style={{
                        fontSize: `${30 * factors.text}px`,
                        filter: "drop-shadow(0px 0px 18px black)",
                    }}
                >
                    <p className="max-w-[700px] text-center mb-8">
                        {/* Full-stack developer experienced in a wide range of
                        languages and technologies */}
                        Full-Stack Entwickler mit Erfahrung in einer Vielzahl
                        von Sprachen und Technologien
                    </p>
                    <div className="font-bold mt-3 text-center">
                        <Link href={"https://github.com/JeremyMoeglich"}>
                            GitHub
                        </Link>{" "}
                        | <Link href={"/overview"}>Projekte</Link> |{" "}
                        <Link href={"/contact"}>Kontakt</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
