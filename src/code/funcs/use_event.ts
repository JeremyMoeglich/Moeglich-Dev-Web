import { useEffect, useState } from "react";
import type { EventTypes } from "../types/event_types";
import { Point } from "../shapelib";
import { panic } from "functional-utilities";

export function useEvent<T extends keyof EventTypes, O>(
    element: EventTarget | undefined,
    event: T,
    getter: (e: EventTypes[T]) => O,
    initial: O
): O {
    const [state, setState] = useState(initial);

    useEffect(() => {
        if (!element) {
            return;
        }
        const handler = ((e: EventTypes[T]) => {
            setState(getter(e));
        }) as (e: Event) => void;

        element.addEventListener(event, handler);

        return () => {
            element.removeEventListener(event, handler);
        };
    }, [element, event, getter]);

    return state;
}

export function useMousePosition(
    element: Element | undefined,
    anchor: "global" | "element"
): Point {
    return useEvent(
        element,
        "mousemove",
        (e) => {
            if (anchor === "global") {
                return new Point(e.clientX, e.clientY);
            } else {
                const rect = (element ?? panic()).getBoundingClientRect();
                return new Point(e.clientX - rect.left, e.clientY - rect.top);
            }
        },
        new Point(0, 0)
    );
}

export function useKeydown(
    element: EventTarget | undefined,
    key: string,
    callback: () => void
): void {
    useEvent(
        element,
        "keydown",
        (e) => {
            if (e.key === key) {
                callback();
            }
        },
        undefined
    );
}

export function useContainerSize(element: React.RefObject<HTMLElement>): Point {
    const [size, setSize] = useState(new Point(1, 1));

    useEffect(() => {
        const observer = new ResizeObserver((_) => {
            const current = element.current;
            if (current) {
                setSize(new Point(current.clientWidth, current.clientHeight));
            }
        });

        if (element.current) {
            observer.observe(element.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [element]);

    return size;
}
