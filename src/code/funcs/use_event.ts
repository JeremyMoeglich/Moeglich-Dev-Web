import { type RefObject, useEffect, useState } from "react";
import type { EventTypes } from "../types/event_types";
import { Point } from "../types/point";

export function useEvent<T extends keyof EventTypes, O>(element: RefObject<HTMLElement>, event: T, getter: (e: EventTypes[T]) => O, initial: O): O {
    const [state, setState] = useState(initial);

    useEffect(() => {
        const current = element.current;
        if (!current) {
            return;
        }
        const handler = ((e: EventTypes[T]) => {
            setState(getter(e));
        }) as (e: Event) => void;

        current.addEventListener(event, handler);

        return () => {
            current.removeEventListener(event, handler);
        };
    }, [element, event, getter]);

    return state;
}

export function useMousePosition(element: RefObject<HTMLElement>, anchor: 'global' | 'element'): Point {
    return useEvent(element, 'mousemove', e => {
        if (anchor === 'global') {
            return new Point(e.clientX, e.clientY);
        } else {
            const current = element.current;
            if (!current) {
                return new Point(0, 0);
            }
            const rect = current.getBoundingClientRect();
            return new Point(e.clientX - rect.left, e.clientY - rect.top);
        }
    }, new Point(0, 0));
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