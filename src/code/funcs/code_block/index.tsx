import React, { useEffect, useRef, useState } from "react";
import { languages } from "../lex";
import { CrossText } from "~/utils/cross_text";
import { panic } from "functional-utilities";
import { LRUCache } from "lru-cache";
import { KeyedToken, Token } from "./tokens";
import { assignKeys } from "./assign_keys";

const IS_BROWSER = typeof window !== "undefined";

let context: CanvasRenderingContext2D | null = null;
if (IS_BROWSER) {
    const canvas = document.createElement("canvas");
    context = canvas.getContext("2d") ?? panic("no context");
}

const textWidthCache = new LRUCache<string, number>({
    max: 1000,
});

const measureTextWidth = (text: string, font: string) => {
    if (!IS_BROWSER) return 0;

    const cacheKey = `${text}_${font}`;
    const cache_result = textWidthCache.get(cacheKey);
    if (cache_result !== undefined) {
        return cache_result;
    }

    if (context) {
        context.font = font;
        const measurement = context.measureText(text).width;
        textWidthCache.set(cacheKey, measurement);
        return measurement;
    }
    return 0;
};

export const CodeBlock: React.FC<{
    code: string;
    language: keyof typeof languages;
    animateId: string;
    scale?: number; // in rem
}> = ({ code, language, animateId, scale = 1.5 }) => {
    const [currentTokens, setCurrentTokens] = useState<KeyedToken[]>([]);
    const language_def = languages[language];
    const fontRef = useRef<HTMLDivElement>(null);
    const font = `${scale}rem "Fira Code", monospace`; // The font you want to use

    useEffect(() => {
        const new_tokens = code.split("\n").flatMap((line, y) => {
            let current_x = 0;
            return language_def(line).map((lex_info, x_index) => {
                const token = {
                    x_index,
                    x: current_x,
                    y,
                    ...lex_info,
                } satisfies Token;
                current_x += measureTextWidth(token.content, font);
                return token;
            });
        });
        setCurrentTokens((prevTokens) => assignKeys(prevTokens, new_tokens));
    }, [font, language_def, code]);

    return (
        <div className="relative" ref={fontRef}>
            {currentTokens.map((token, i) => {
                return (
                    <div
                        key={`${animateId}-${token.key}-${i}`}
                        className="absolute min-w-max"
                        aria-label={`${animateId}-${token.key}-${i}`}
                        style={{
                            top: `${token.y * scale}rem`,
                            left: `${token.x}px`, // x is now in pixels
                            fontSize: `${scale}rem`,
                            ...token.color.textColorStyle(),
                            fontFamily: `"Fira Code", monospace`,
                        }}
                    >
                        <CrossText
                            tokens={[token.content]}
                            animateId={`${animateId}-${token.key}`}
                        />
                    </div>
                );
            })}
        </div>
    );
};


