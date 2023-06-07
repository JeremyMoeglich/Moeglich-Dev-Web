import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    type PropsWithRef,
} from "react";
import { isEqual } from "lodash-es";
import { has_property, panic } from "functional-utilities";
import { type Stage } from "../slides/stage";
import { type EasingFunctionName, easingFunctions } from "./ease";
import { v4 } from "uuid";
import type { Id } from "../shapelib/types/interfaces";

export interface Interpolate extends Id {
    interpolate(t: number, to: this): this;
    to_start(): this;
    is_this(value: unknown): value is this;
    similarity(to: this): number; // 0 is identical
}

function isInterpolate(value: unknown): value is Interpolate {
    return (
        typeof value === "object" &&
        value !== null &&
        has_property(value, "interpolate") &&
        typeof value.interpolate === "function" &&
        has_property(value, "to_start") &&
        typeof value.to_start === "function" &&
        has_property(value, "is_this") &&
        typeof value.is_this === "function" &&
        has_property(value, "similarity") &&
        typeof value.similarity === "function"
    );
}

function interpolateProps<T>(
    startProps: T,
    endProps: T,
    progress: number,
    disable?: (keyof T)[]
): T {
    if (
        startProps === endProps ||
        startProps === undefined ||
        startProps === null ||
        endProps === undefined ||
        endProps === null
    ) {
        return endProps;
    } else if (
        isInterpolate(startProps) &&
        isInterpolate(endProps) &&
        startProps.is_this(endProps)
    ) {
        return startProps.interpolate(progress, endProps);
    } else if (
        Array.isArray(startProps) &&
        Array.isArray(endProps) &&
        startProps.length === endProps.length
    ) {
        return startProps.map((prop, index) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            interpolateProps(prop, endProps[index], progress)
        ) as T;
    } else if (
        typeof startProps === "object" &&
        typeof endProps === "object" &&
        startProps &&
        endProps
    ) {
        const result = {} as T;
        for (const key in startProps) {
            if (
                startProps.hasOwnProperty(key) &&
                endProps.hasOwnProperty(key)
            ) {
                if (!disable || !disable.includes(key as keyof T)) {
                    result[key] = interpolateProps(
                        startProps[key],
                        endProps[key],
                        progress
                    );
                } else {
                    result[key] = endProps[key];
                }
            }
        }
        return result;
    } else if (
        (typeof startProps === "number" && typeof endProps === "number") ||
        (typeof startProps === "bigint" && typeof endProps === "bigint")
    ) {
        const num =
            Number(startProps) +
            (Number(endProps) - Number(startProps)) * progress;
        if (typeof startProps === "bigint") {
            return BigInt(Math.round(num)) as T;
        } else {
            return num as T;
        }
    } else if (startProps instanceof Date && endProps instanceof Date) {
        const startTime = startProps.getTime();
        const endTime = endProps.getTime();
        return new Date(startTime + (endTime - startTime) * progress) as T;
    } else {
        return endProps;
    }
}

// Define the prop types
type Props<T> = {
    props_list: PropsWithRef<T>[];
    Component: React.FC<T>;
    current: number;
    switch_duration: number;
    ease?: EasingFunctionName;
    disable?: (keyof T)[];
};

export const Interpolator = <T,>({
    props_list,
    Component: Component,
    current,
    switch_duration,
    ease = "easeOutCubic",
    disable = [],
}: Props<T>) => {
    const [interpolatedProps, setInterpolatedProps] = useState(
        () =>
            props_list[current] ??
            (() => {
                console.warn("Invalid current index");
                return props_list[0];
            })() ??
            panic("No props provided")
    );
    const prevProps = useRef<PropsWithRef<T>>(interpolatedProps);
    const requestRef = useRef<number>();

    const ease_func = easingFunctions[ease];

    const MemoizedComponent = useMemo(() => React.memo(Component), [Component]);

    useEffect(() => {
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / switch_duration, 1);
            const progress = ease_func(t);

            const newProps = interpolateProps(
                interpolatedProps as T,
                (props_list[current] ??
                    (() => {
                        console.warn("Invalid current index");
                        return props_list[0];
                    })() ??
                    panic("No props provided")) as T,
                progress,
                disable
            );

            if (!isEqual(prevProps.current, newProps)) {
                setInterpolatedProps(newProps as typeof interpolatedProps);
                prevProps.current = newProps as PropsWithRef<T>;
            }

            if (progress < 1) {
                requestRef.current = requestAnimationFrame(animate);
            } else {
                requestRef.current = undefined;
            }
        };

        if (requestRef.current === undefined) {
            requestRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (requestRef.current !== undefined) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = undefined;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props_list, Component, current, switch_duration]);

    return <MemoizedComponent {...interpolatedProps} />;
};

type InterpolatorStageProps<T> = {
    props_list: PropsWithRef<T>[];
    Component: React.FC<T>;
    switch_duration: number;
    ease?: EasingFunctionName;
    disable?: (keyof T)[];
};

export function InterpolatorStage<T>(props: InterpolatorStageProps<T>): Stage {
    const key = v4();
    return {
        id: "interpolator",
        stage_duration: props.props_list.length,
        Component: (substage_index: number) => (
            <Interpolator {...props} current={substage_index} key={key} />
        ),
    };
}
