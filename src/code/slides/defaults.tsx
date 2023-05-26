import { CrossText } from "~/utils/cross_text";
import { FancyText } from "../funcs/fancy_text";

export const defaults = {
    title: (text: string) => (
        <FancyText
            text={text}
            animateId="title"
            fontSize="3em"
            color="blueGradient"
        />
    ),
    aspects: (aspects: string[], t?: number) => (
        <div className="text-white text-2xl">
            {aspects.map((aspect, i) => (
                <div
                    key={i}
                    style={{
                        opacity: t === undefined ? 1 : Math.min(1, t - i),
                    }}
                >
                    <CrossText animateId="aspect" text={aspect} />
                </div>
            ))}
        </div>
    ),
};
