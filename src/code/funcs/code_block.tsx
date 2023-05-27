import React, { useEffect, useMemo } from "react";
import { languages } from "./lex";
import { CrossText } from "~/utils/cross_text";
import { Color } from "./color";
import { v4 } from "uuid";
import { panic } from "functional-utilities";

export const CodeBlock: React.FC<{
    code: string;
    language: keyof typeof languages;
    animateId: string;
}> = ({ code, language, animateId }) => {
    const [currentTokens, setCurrentTokens] = React.useState<KeyedToken[][]>(
        []
    );
    const language_def = languages[language];

    const lines = code.split("\n");

    useEffect(() => {
        const new_tokens = lines.flatMap((line, y) =>
            language_def(line).map(
                (lex_info, x) =>
                    ({
                        x,
                        y,
                        ...lex_info,
                    } satisfies Token)
            )
        );
        const keyed = alignTokens(assignKeys(currentTokens.flat(), new_tokens));
        setCurrentTokens(keyed);
    }, [code]);

    return (
        <div className="relative">
            {currentTokens.map((line) => {
                return (
                    <div key={hashObject(line)}>
                        {line.map((token, i) => {
                            return (
                                <div
                                    key={`${i}-${token.content}`}
                                    style={token.color.textColorStyle()}
                                    className="inline-block"
                                    aria-label={token.key}
                                >
                                    <CrossText
                                        text={token.content.replace(
                                            / /g,
                                            "\u00A0"
                                        )}
                                        animateId={`animateId-${token.key}`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

interface Token {
    x: number; // index in line
    y: number; // line index
    content: string; // the token itself
    token_type: string; // the type of token for example IDENT
    color: Color; // the color of the token
}

interface KeyedToken extends Token {
    key: string;
}

function assignKeys(
    previous_tokens: KeyedToken[],
    new_tokens: Token[]
): KeyedToken[] {
    // Create a map for fast lookup
    const previousMap: Map<string, KeyedToken[]> = new Map();

    previous_tokens.forEach((token) => {
        const identifier = token.content + token.token_type;
        if (previousMap.has(identifier)) {
            previousMap.get(identifier)!.push(token);
        } else {
            previousMap.set(identifier, [token]);
        }
    });

    const usedKeys: Set<string> = new Set();

    const keyed_tokens: KeyedToken[] = new_tokens.map((token) => {
        const identifier = token.content + token.token_type;

        if (previousMap.has(identifier)) {
            const previous_tokens = previousMap.get(identifier)!;
            for (const [i, previous_token] of previous_tokens.entries()) {
                // Check if this token has been used before, if not, use it and mark it as used
                if (!usedKeys.has(previous_token.key)) {
                    usedKeys.add(previous_token.key);
                    previous_tokens.splice(i, 1); // remove the used token
                    return { ...token, key: previous_token.key };
                }
            }
        }

        // If no previous token found or all previous tokens with the same identifier have been used,
        // generate a new unique key
        const key = v4();
        usedKeys.add(key);
        return { ...token, key: key };
    });

    return keyed_tokens;
}

function hashObject(obj: object): number {
    const str = JSON.stringify(obj);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to a 32bit integer
    }

    return hash;
}

function alignTokens(tokens: KeyedToken[]): KeyedToken[][] {
    // Return an empty array if there are no tokens
    if (tokens.length === 0) {
        return [];
    }

    // Sort the tokens by their y and then x
    tokens.sort((a, b) => {
        if (a.y === b.y) {
            return a.x - b.x;
        }
        return a.y - b.y;
    });

    // Split the sorted tokens into lines
    const lines: KeyedToken[][] = [];
    let currentLine: KeyedToken[] = [];
    let currentY = (tokens[0] ?? panic()).y;

    for (const token of tokens) {
        if (token.y === currentY) {
            currentLine.push(token);
        } else {
            lines.push(currentLine);
            currentLine = [token];
            currentY = token.y;
        }
    }
    // Push the last line
    lines.push(currentLine);

    return lines;
}
