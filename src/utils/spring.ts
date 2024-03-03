import { useState, useEffect } from "react";
import { useAnimationTime } from "./use_update";
import { type Data, compare_data } from "./datacomp";
import { panic } from "functional-utilities";

export function useSimpleSpring<T extends Data<number>>(
    target: T,
    { stiffness = 170, damping = 26, initial = target } = {},
): T {
    const [currentValue, setCurrentValue] = useState(initial);
    const [lastValue, setLastValue] = useState(initial);
    const [lastTime, setLastTime] = useState(performance.now());

    const t = useAnimationTime();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        const dt = (t - lastTime) / 1000;
        if (dt > 1) {
            setLastTime(t);
            setCurrentValue(target);
            setLastValue(target);
            return;
        }
        setLastTime(t);

        const acceleration =
            compare_data(
                [target, currentValue, lastValue],
                ([t, c, l]) => stiffness * (t - c) - (damping * (c - l)) / dt,
            ) ?? panic("The structure of the data is not the same");

        const newValue =
            compare_data(
                [currentValue, lastValue, acceleration],
                ([c, l, a]) => 2 * c - l + a * dt ** 2,
            ) ?? panic("The structure of the data is not the same");

        setLastValue(currentValue);
        setCurrentValue(newValue as T);
    }, [t]);

    return currentValue as T;
}
