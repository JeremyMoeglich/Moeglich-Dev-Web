import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "~/utils/use_update";

function shift(letters: string[], i: number) {
    const widths: MutableRefObject<number[] | undefined> = useRef([]);
    const [containerWidth, setContainerWidth] = useState(0);
    const refs = letters.map(() => useRef<HTMLDivElement>(null));

    useEffect(() => {
        // Calculate widths once the divs are mounted
        widths.current = refs.map((ref) => ref.current?.offsetWidth || 0);
        // Set initial container width based on index i
        setContainerWidth(widths.current[i] ?? 0);
    }, [letters, i]);

    // Let's say you have some animation function to interpolate values
    // Assuming this function animates from 0 to 1 over some duration
    const animationValue = someAnimationFunction();

    const animatedWidth = widths.current
        ? widths.current[i] * animationValue
        : 0;

    return (
        <div
            style={{
                width: animatedWidth,
                overflow: "hidden",
            }}
        >
            {letters.map((l, index) => (
                <div key={index} ref={refs[index]}>
                    {l}
                </div>
            ))}
        </div>
    );
}
export function TopAnimation() {
    const t = useAnimationFrame() / 1000;
    const f = (i: number) => (Math.sin(t + i * 0.3) + 1) / 2;
    return (
        <div className="text-[200px] font-bold">
            {"moeglich.dev".split("").map((letter, index) => (
                <span key={index} className="inline-block overflow-hidden">
                    <div
                        style={{
                            transform: `translate(${f(index) * 200}px, ${
                                f(index) * 200
                            }px)`,
                        }}
                    >
                        {letter}
                    </div>
                </span>
            ))}
        </div>
    );
}
