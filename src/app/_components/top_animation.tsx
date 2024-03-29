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
}: {
    parts: (string | undefined)[];
    i: number;
    style?: React.CSSProperties;
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
                fontSize: "120px",
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

export function TopAnimation() {
    const words = ["moeglich.dev", "Jeremy\nMoeglich"];

    const t = useAnimationTime();
    const i = Math.floor(t / 5000) % words.length;
    const cnoise = useConstant(makeNoise2D(seeded_rand(534)));
    const letter_parts = zip_longest(words.map((word) => word.split("")));

    return (
        <div className="flex justify-center">
            <div className="w-fit">
                <div className="relative flex flex-row w-[900px]">
                    {letter_parts.map((parts, index) => (
                        <Shift
                            key={index}
                            parts={parts}
                            i={i}
                            style={{
                                color: Color.fromHex("#cfcfcf")
                                    .interpolate(
                                        cnoise(index / 10, t / 4000),
                                        Color.fromHex("#f2f55a"),
                                    )
                                    .getHex(),
                            }}
                        />
                    ))}
                </div>
                <div className="text-3xl text-white">
                    <p className="max-w-[700px]">
                        {/* Full-stack developer experienced in a wide range of
                        languages and technologies */}
                        Full-Stack entwickler mit Erfahrung in einer Vielzahl
                        von Sprachen und Technologien
                    </p>
                    <div className="font-bold mt-3">
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
