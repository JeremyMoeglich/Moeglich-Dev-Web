import { CrossText } from "~/utils/cross_text";
import { FancyText } from "../funcs/fancy_text";
import { splitString } from "../funcs/code_block/word_split";

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
                        tokens={splitString(aspect)}
                    />
                </div>
            ))}
        </div>
    ),
};
