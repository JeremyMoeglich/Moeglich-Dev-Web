"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { isEqual, minBy, sum } from "lodash-es";
import { panic, zip } from "functional-utilities";
import { type Stage } from "../slides/stage";
import { type EasingFunctionName, easingFunctions } from "./ease";
import { v4 } from "uuid";
import {
    type Bundle,
    type Bundler,
    createBundle,
    is_bundle,
    type ThisReturn,
    type UnMarkThis,
} from "../bundle";

export interface Interpolate {
    interpolate(t: number, to: UnMarkThis<this>): this & ThisReturn;
    to_start(): this & ThisReturn;
    can_interpolate(value: unknown): boolean;
    similarity(to: UnMarkThis<this>): number; // 0 is identical
}

function is_Interpolate(value: unknown): value is Interpolate {
    return (
        (value as Interpolate).interpolate !== undefined &&
        (value as Interpolate).to_start !== undefined &&
        (value as Interpolate).can_interpolate !== undefined &&
        (value as Interpolate).similarity !== undefined
    );
}

export const interpolate_bundler: Bundler<Interpolate, Interpolate> = {
    isType: is_Interpolate,
    functionality: {
        interpolate: (from, t, to) => {
            if (!is_bundle(to, is_Interpolate))
                return to.to_start().interpolate(t, to);

            const matchedItems = new Set();
            const interpolated = to.objs.map((s1) => {
                const matched = minBy(
                    from.filter(
                        (s2) => !matchedItems.has(s2) && s1.can_interpolate(s2)
                    ),
                    (s2) => s1.similarity(s2)
                );
                if (matched) {
                    matchedItems.add(matched);
                }
                if (!matched) return s1.to_start().interpolate(t, s1);
                return matched.interpolate(t, s1);
            });

            const absentInTo = from.filter(
                (s1) =>
                    !matchedItems.has(s1) &&
                    !to.objs.some((s2) => s1.can_interpolate(s2))
            );
            const animatingOutShapes = absentInTo.map((s1) =>
                s1.interpolate(t, s1.to_start())
            );

            // Filter out shapes that have reached their "start" state
            const survivingShapes = animatingOutShapes.filter(() => t < 1);

            // Combine the interpolated shapes and the animating out shapes
            return createBundle([...interpolated, ...survivingShapes]);
        },
        to_start: (from) => {
            return createBundle(from.map((s) => s.to_start()));
        },
        can_interpolate: (_, value): value is Bundle<Interpolate> => {
            if (is_bundle(value, is_Interpolate)) {
                return true;
            } else {
                return false;
            }
        },
        similarity: (from, to) => {
            if (!is_bundle(to, is_Interpolate)) return Infinity;
            const s =
                sum(
                    zip([from, to.objs]).map(([s1, s2]) => {
                        if (!s1.can_interpolate(s2)) return Infinity;
                        return s1.similarity(s2);
                    })
                ) *
                (1 + Math.abs(from.length - to.objs.length));
            return s;
        },
    },
};

export function interpolateProps<T>(
    startProps: T,
    endProps: T,
    progress: number,
    disable?: (keyof T)[]
): T {
    if (progress === 1) {
        return endProps;
    } else if (progress === 0) {
        return startProps;
    } else if (
        startProps === endProps ||
        startProps === undefined ||
        startProps === null ||
        endProps === undefined ||
        endProps === null
    ) {
        return endProps;
    } else if (
        is_Interpolate(startProps) &&
        is_Interpolate(endProps) &&
        startProps.can_interpolate(endProps)
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
    props_list: T[];
    Component: React.FC<T & { static_props: T }>;
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
    const props =
        props_list[current] ??
        (() => {
            console.warn("Invalid current index");
            return props_list[0];
        })() ??
        panic("No props provided");
    const [interpolatedProps, setInterpolatedProps] = useState(() => props);
    const prevProps = useRef<T>(interpolatedProps);
    const requestRef = useRef<number>();

    const ease_func = easingFunctions[ease];

    const MemoizedComponent = useMemo(() => React.memo(Component), [Component]);

    useEffect(() => {
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / switch_duration, 1);
            const progress = ease_func(t);
            interpolatedProps;
            const newProps = interpolateProps(
                interpolatedProps as T,
                props as T,
                progress,
                disable
            );

            if (!isEqual(prevProps.current, newProps)) {
                setInterpolatedProps(newProps as typeof interpolatedProps);
                prevProps.current = newProps;
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

    return (
        <MemoizedComponent
            {...{
                ...interpolatedProps,
                static_props: props,
            }}
        />
    );
};

type InterpolatorStageProps<T> = {
    props_list: T[];
    Component: React.FC<T & { static_props: T }>;
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
