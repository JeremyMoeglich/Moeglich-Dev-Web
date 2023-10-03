/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useAnimationTime } from "./use_update";
import { type Data, compare_data, map_data } from "./datacomp";
import { panic } from "functional-utilities";

export function useSimpleSpring<T extends Data<number>>(
    target: T,
    { stiffness = 170, damping = 26, initial = target } = {},
): T {
    const [currentValue, setCurrentValue] = useState(initial);
    const [velocity, setVelocity] = useState(map_data(target, () => 0));
    const [lastTime, setLastTime] = useState(performance.now());

    const t = useAnimationTime();

    useEffect(() => {
        const true_dt = (t - lastTime) / 1000;
        if (true_dt > 1) {
            setLastTime(t);
            setVelocity(map_data(target, () => 0));
            setCurrentValue(target);
            return;
        }
        const dt = Math.min(true_dt, 0.1); // Delta time in seconds
        setLastTime(t);

        const newVelocity =
            compare_data(
                [velocity, target, currentValue],
                ([v, t, c]) => v + (stiffness * (t - c) - damping * v) * dt,
            ) ?? panic("The structure of the data is not the same");
        const newValue =
            compare_data([currentValue, newVelocity], ([c, v]) => c + v * dt) ??
            panic("The structure of the data is not the same");

        setVelocity(newVelocity);
        setCurrentValue(newValue as T);
    }, [t]);

    return currentValue as T;
}
