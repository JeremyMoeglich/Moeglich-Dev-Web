import { useKeydown } from "~/code/funcs/use_event";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { useEffect, useState } from "react";
import { get_slides } from "~/code/slides/slide_data";
import { panic } from "functional-utilities";
import { maybe_window } from "~/utils/maybe_window";
import useLocalStorage from "use-local-storage";
import { ShapeRenderProvider } from "~/code/shapelib/funcs/shape_render";

function FullScreenApp() {
    const handle = useFullScreenHandle();
    const [is_fullscreen, set_is_fullscreen] = useState(false);
    useKeydown(
        maybe_window(),
        "f",
        () =>
            void (async () => {
                if (is_fullscreen) {
                    await handle.exit();
                } else {
                    await handle.enter();
                }
                set_is_fullscreen((prev) => !prev);
            })()
    );
    useKeydown(
        maybe_window(),
        "Escape",
        () =>
            void (async () => {
                await handle.exit();
                set_is_fullscreen(false);
            })()
    );
    return (
        <FullScreen handle={handle}>
            <ShapeRenderProvider>
                <App />
            </ShapeRenderProvider>
        </FullScreen>
    );
}

const slides = get_slides();

function App() {
    const [slide_index, unchecked_setSlideIndex] = useLocalStorage(
        "CurrentSlide",
        0
    );
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const clampSlideIndex = (index: number) => {
        return Math.max(0, Math.min(slides.length - 1, index));
    };

    const setSlideIndex = (index: number | ((index: number) => number)) => {
        if (typeof index === "number") {
            unchecked_setSlideIndex(clampSlideIndex(index));
        } else {
            unchecked_setSlideIndex((prev_index) => {
                const new_index = index(prev_index ?? 0);
                return clampSlideIndex(new_index);
            });
        }
    };
    const next_slide = () => {
        setSlideIndex((prev_index) => prev_index + 1);
    };
    const prev_slide = () => {
        setSlideIndex((prev_index) => prev_index - 1);
    };

    useKeydown(maybe_window(), "ArrowRight", next_slide);
    useKeydown(maybe_window(), "ArrowLeft", prev_slide);
    useKeydown(maybe_window(), "ArrowUp", prev_slide);
    useKeydown(maybe_window(), "ArrowDown", next_slide);

    const slide =
        slides[slide_index] ??
        (() => {
            const clamped = clampSlideIndex(slide_index);
            setSlideIndex(clamped);
            return slides[clamped] ?? panic("no slide");
        })();
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-slate-900">
            {isHydrated && (
                <>
                    <div className="relative w-full grow font-bold">
                        {slide.Component()}
                    </div>
                    <p>
                        {slide_index + 1} / {slides.length}
                    </p>
                </>
            )}
        </div>
    );
}

export default FullScreenApp
