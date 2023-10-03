import { useEffect, useState } from "react";
import type { EventTypes } from "../event_types";
import { Point } from "../shapelib";
import { panic } from "functional-utilities";
import { zerozero } from "../shapelib/types/point";
import { maybe_window } from "~/utils/maybe_window";
import { useUpdate } from "~/utils/use_update";


export function useEvent<T extends keyof EventTypes, O>(
    element: EventTarget | undefined,
    event: T,
    getter: (e: EventTypes[T]) => O,
    initial: O,
): O {
    const state = useUpdate((callback) => {
        if (!element) {
            return;
        }
        const handler = ((e: EventTypes[T]) => {
            callback(getter(e));
        }) as (e: Event) => void;

        element.addEventListener(event, handler);

        return () => {
            element.removeEventListener(event, handler);
        };
    }, initial)
    return state;
}


export function useMousePosition(
    element: Element | undefined,
    anchor: "global" | "element",
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
        zerozero,
    );
}

export function useKeydown(
    element: EventTarget | undefined,
    key: string,
    callback: () => void,
): void {
    useEvent(
        element,
        "keydown",
        (e) => {
            if (e.key === key) {
                callback();
            }
        },
        undefined,
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

export function useWindowSize(): Point {
    const [size, setSize] = useState<Point>(new Point(1, 1));

    useEffect(() => {
        const win = maybe_window();
        const handleResize = () => {
            if (win) {
                setSize(new Point(win.innerWidth, win.innerHeight));
            }
        };

        if (win) {
            win.addEventListener("resize", handleResize);
            handleResize(); // Initial call to set size
        }

        return () => {
            if (win) {
                win.removeEventListener("resize", handleResize);
            }
        };
    }, []); // Empty dependency array makes sure the effect only runs on mount and unmount

    return size;
}
