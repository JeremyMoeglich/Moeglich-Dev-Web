"use client";

import { useEffect, useRef, useState } from "react";

export function useSimulation<S>(
    func: (curr: S, dt: number, t: number) => S,
    initial: S,
    speed = 1,
): S {
    const [state, setState] = useState(initial);
    const last_t = useRef(performance.now()); // Initialize to current time

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            const t = performance.now() * speed;
            const dt = t - last_t.current;
            last_t.current = t;
            setState((prevState) => func(prevState, dt, t));

            animationFrameId = requestAnimationFrame(animate);
        };

        animate(); // Initial call to set the loop

        return () => {
            cancelAnimationFrame(animationFrameId); // Cleanup
        };
    }, []); // Empty dependency array ensures this effect runs once

    return state;
}
