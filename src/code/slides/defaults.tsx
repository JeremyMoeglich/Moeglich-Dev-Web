import { CrossText } from "~/utils/cross_text";
import { FancyText } from "../funcs/fancy_text";
import { split_include } from "~/utils/split_include";

export const defaults = {
    title: (text: string | string[]) => (
        <FancyText
            text={text}
            animateId="title"
            fontSize="3em"
            color="blueGradient"
        />
    ),
    aspects: (aspects: string[], t?: number) => (
        <div className="text-2xl text-white">
            {aspects.map((aspect, i) => (
                <div
                    key={i}
                    style={{
                        opacity: t === undefined ? 1 : Math.min(1, t - i),
                    }}
                >
                    <CrossText
                        animateId="aspect"
                        tokens={split_include(aspect, " ")}
                    />
                </div>
            ))}
        </div>
    ),
};
