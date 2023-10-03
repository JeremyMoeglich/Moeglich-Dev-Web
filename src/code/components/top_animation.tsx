/* eslint-disable react-hooks/exhaustive-deps */
import { makeNoise2D } from "fast-simplex-noise";
import { zip_longest } from "functional-utilities";
import { useEffect, useRef, useState } from "react";
import { useSimpleSpring } from "~/utils/spring";
import { useConstant } from "~/utils/use_persist";
import { useAnimationTime } from "~/utils/use_update";
import { Color } from "../funcs/color";
// import { useContainerSize } from "../funcs/use_event";

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
        parts.map((_) => ({ width: 0, height: 0 })),
    );
    const size = useSimpleSpring(sizes[i] ?? { width: 0, height: 0 });
    const smooth_i = useSimpleSpring(i);
    const max_size = sizes.reduce(
        (prev, curr) => ({
            width: Math.max(prev.width, curr.width),
            height: Math.max(prev.height, curr.height),
        }),
        { width: 0, height: 0 },
    );

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
                width: size.width,
                height: size.height,
                fontSize: "200px",
                fontFamily: "'Gabarito', cursive",
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
    const cnoise = useConstant(makeNoise2D());
    const letter_parts = zip_longest(words.map((word) => word.split("")));

    return (
        <div className="flex h-full flex-col items-center justify-center">
            <div className="flex flex-row">
                {letter_parts.map((parts, index) => (
                    <Shift
                        key={index}
                        parts={parts}
                        i={i}
                        style={{
                            color: Color.fromHex("#818181")
                                .interpolate(
                                    cnoise(index / 10, t / 4000),
                                    Color.fromHex("#f2f55a"),
                                )
                                .getHex(),
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
