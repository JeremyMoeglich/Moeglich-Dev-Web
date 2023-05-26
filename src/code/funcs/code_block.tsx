import React from "react";
import { languages } from "./lex";
import { CrossText } from "~/utils/cross_text";

export const CodeBlock: React.FC<{
    code: string;
    language: keyof typeof languages;
    animateId: string;
}> = ({ code, language, animateId }) => {
    const language_def = languages[language];

    const lines = code.split("\n");
    const token_lines = lines.map((line) => language_def(line));
    const hash = hashObject(token_lines);

    return (
        <div>
            {token_lines.map((line, i) => {
                return (
                    <div key={`${i}-${hash}`}>
                        {line.map((token, j) => {
                            return (
                                <div
                                    key={`${i}-${j}-${hash}`}
                                    style={token[1].textColorStyle()}
                                    className="inline-block"
                                >
                                    <CrossText
                                        text={token[0]}
                                        animateId={animateId}
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


function hashObject(obj: object): string {
    const str = JSON.stringify(obj);
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
  