import React, { ReactNode, useEffect, useRef, useState } from "react";
import { languages } from "../lex";
import { CrossText } from "~/utils/cross_text";
import { panic } from "functional-utilities";
import { LRUCache } from "lru-cache";
import { KeyedToken, Token } from "./tokens";
import { assignKeys } from "./assign_keys";
import Image from "next/image";
import { motion } from "framer-motion";
import { content } from "flo-poly";

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

const LanguageIcon: React.FC<{ language: keyof typeof languages }> = ({ language }) => {
    const path = `/images/languages/${language}.svg`;
    return (
        <motion.img
            src={path}
            alt={language}
            className="inline-block w-full h-full"
            layoutId={`language-icon-${language}`}
        />
    );
}

export const CodeBlock: React.FC<{
    code: string;
    language: keyof typeof languages;
    animateId: string;
    scale?: number; // in rem
    show_icon?: boolean;
}> = ({ code, language, animateId, scale = 1.5, show_icon = true }) => {
    const [currentTokens, setCurrentTokens] = useState<KeyedToken[]>([]);
    const language_def = languages[language];
    const fontRef = useRef<HTMLDivElement>(null);
    const font = `${scale}rem "Fira Code", monospace`; // The font you want to use

    useEffect(() => {
        const lines = code.split("\n");
        const new_tokens = lines.flatMap((line, y) => {
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
        const size = new_tokens.reduce((acc, token) => {
            return {
                x: Math.max(acc.x, token.x + token.content.length),
                y: Math.max(acc.y, token.y),
            };
        }, { x: 0, y: 0 });
        const offset_tokens = new_tokens.map((token) => {
            return {
                ...token,
                y: token.y - size.y / 2,
                x: token.x - size.x / 2,
            }
        });
        setCurrentTokens((prevTokens) => assignKeys(prevTokens, offset_tokens));
    }, [font, language_def, code]);

    const icon_pos = currentTokens.reduce((acc, token) => {
        return {
            x: Math.max(acc.x, token.x + token.content.length),
            y: Math.max(acc.y, token.y),
        };
    }, { x: 0, y: 0 });

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
            {show_icon && currentTokens.length !== 0 && (
                <div
                    className="absolute top-0 left-0 w-16 h-16"
                    style={{
                        transform: `translate(${icon_pos.x + 20}px, ${(icon_pos.y + 1) * scale}rem)`,
                    }}
                >
                    <LanguageIcon language={language} />
                </div>
            )}
        </div>
    );
};


