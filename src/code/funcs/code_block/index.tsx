import React, { useEffect, useRef, useState } from "react";
import { languages } from "../lex";
import type { KeyedToken, Token } from "./tokens";
import { assignKeys } from "./assign_keys";
import { Point } from "~/code/shapelib";
import { measureTextSize } from "~/code/shapelib/types/text";
import { AnimatePresence, motion } from "framer-motion";

const LanguageIcon: React.FC<{ language: keyof typeof languages }> = ({
    language,
}) => {
    const path = `/images/languages/${language}.svg`;
    return (
        <AnimatePresence>
            <motion.img
                src={path}
                alt={language}
                className="absolute h-full w-full"
                key={language}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
            />
        </AnimatePresence>
    );
};

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
    const font = `"Fira Code", monospace`;

    // biome-ignore lint/correctness/useExhaustiveDependencies: font changes size
    useEffect(() => {
        const lines = code.split("\n");
        const new_tokens = lines.flatMap((line, y) => {
            let current_x = 0;
            return language_def(line).map((lex_info, x_index) => {
                const token = {
                    x_index,
                    position: new Point(current_x, y),
                    ...lex_info,
                } satisfies Token;
                current_x += measureTextSize(
                    token.content,
                    scale,
                    1.2,
                    "rem",
                    font,
                ).width;
                return token;
            });
        });
        const size = new_tokens.reduce(
            (acc, token) => {
                return {
                    x: Math.max(acc.x, token.position.x + token.content.length),
                    y: Math.max(acc.y, token.position.y),
                };
            },
            { x: 0, y: 0 },
        );
        const offset_tokens = new_tokens.map((token) => {
            return {
                ...token,
                position: new Point(
                    token.position.x - size.x / 2,
                    token.position.y - size.y / 2,
                ),
            };
        });
        setCurrentTokens((prevTokens) => assignKeys(prevTokens, offset_tokens));
    }, [font, language_def, code, scale]);

    const icon_pos = currentTokens.reduce(
        (acc, token) => {
            return {
                x: Math.max(acc.x, token.position.x + token.content.length),
                y: Math.max(acc.y, token.position.y),
            };
        },
        { x: 0, y: 0 },
    );

    return (
        <div className="relative" ref={fontRef}>
            {currentTokens.map((token, i) => {
                return (
                    <div
                        key={`${animateId}-${token.key}`}
                        className="absolute font-normal transition-all duration-700"
                        aria-label={`${animateId}-${token.key}-${i}`}
                        style={{
                            transform: `translate(${token.position.x}px, ${`${
                                token.position.y * scale
                            }rem`})`,
                            fontSize: `${scale}rem`,
                            ...token.color.textColorStyle(),
                            fontFamily: `"Fira Code", monospace`,
                        }}
                    >
                        {token.content}
                    </div>
                );
            })}
            {show_icon && currentTokens.length !== 0 && (
                <div
                    className="absolute left-0 top-0 h-16 w-16"
                    style={{
                        transform: `translate(${icon_pos.x + 20}px, ${
                            (icon_pos.y + 1.3) * scale
                        }rem)`,
                        transition: "transform 700ms",
                    }}
                >
                    <LanguageIcon language={language} />
                </div>
            )}
        </div>
    );
};
