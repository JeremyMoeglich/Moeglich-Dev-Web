import { Lexer, createToken } from "chevrotain";
import { Color } from "./color";
import { panic } from "functional-utilities";

const colors = {
    Keyword: new Color(171, 106, 212),
    Whitespace: new Color(128, 128, 128),
    Identifier: new Color(61, 154, 255),
    Number: new Color(181, 206, 168),
    String: new Color(206, 145, 120),
    Punctuation: new Color(243, 255, 48),
    Operator: new Color(216, 255, 211),
    Comment: new Color(87, 166, 74),
    Boolean: new Color(152, 118, 170),
    Null: new Color(129, 162, 190),
    Undefined: new Color(179, 101, 57),
    Lifetime: new Color(171, 178, 191),
    Char: new Color(78, 201, 176),
    Macro: new Color(138, 75, 143),
    Indentation: new Color(128, 128, 128),
} as const;

export const languages = {
    js: lex_to_lang(
        new Lexer([
            createToken({
                name: "Keyword",
                pattern:
                    /if|else|for|while|do|break|continue|return|function|class|new|delete|try|catch|throw|finally|switch|case|default|import|export|from|as|instanceof|typeof|void|with|in|let|const|var|yield|async|await/,
            }),
            createToken({
                name: "Whitespace",
                pattern: /\s+/,
            }),
            createToken({
                name: "Number",
                pattern:
                    /0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|[0-9]+(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?/,
            }),
            createToken({
                name: "String",
                pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
            }),
            createToken({
                name: "Punctuation",
                pattern: /[\[\]{}().,:]/,
            }),
            createToken({
                name: "Operator",
                pattern:
                    /\+\+|;|--|=>|&&|\|\||<<|>>|<=|>=|==|!=|[-+*/%&|^!=<>]=?|\?|:/,
            }),
            createToken({
                name: "Comment",
                pattern: /\/\*[^]*?\*\//,
            }),
            createToken({
                name: "Boolean",
                pattern: /true|false/,
            }),
            createToken({
                name: "Null",
                pattern: /null/,
            }),
            createToken({
                name: "Undefined",
                pattern: /undefined/,
            }),
            createToken({
                name: "Identifier",
                pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
            }),
        ]),
        colors
    ),
    rust: lex_to_lang(
        new Lexer([
            createToken({
                name: "Keyword",
                pattern:
                    /as|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|unsafe|use|where|while/,
            }),
            createToken({
                name: "Whitespace",
                pattern: /\s+/,
            }),
            createToken({
                name: "Lifetime",
                pattern: /'[a-zA-Z_][a-zA-Z0-9_]*/,
            }),
            createToken({
                name: "Number",
                pattern:
                    /0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|[0-9]+(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?/,
            }),
            createToken({
                name: "String",
                pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
            }),
            createToken({
                name: "Char",
                pattern: /'(?:[^'\\]|\\.)*'/,
            }),
            createToken({
                name: "Punctuation",
                pattern: /[\[\]{}().,;:]/,
            }),
            createToken({
                name: "Operator",
                pattern:
                    /-\>|->|=>|&&|\|\||<<|>>|<=|>=|==|!=|[-+*/%&|^!=<>]=?|\?|:/,
            }),
            createToken({
                name: "Macro",
                pattern: /[a-zA-Z_][a-zA-Z0-9_]*!\s*\{/,
            }),
            createToken({
                name: "Comment",
                pattern: /\/\/.*|#[^]*\n/,
            }),
            createToken({
                name: "Boolean",
                pattern: /true|false/,
            }),
            createToken({
                name: "Null",
                pattern: /None/,
            }),
            createToken({
                name: "Undefined",
                pattern: /unimplemented\!/,
            }),
            createToken({
                name: "Identifier",
                pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
            }),
        ]),
        colors
    ),
    python: lex_to_lang(
        new Lexer([
            createToken({
                name: "Keyword",
                pattern:
                    /and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield/,
            }),
            createToken({
                name: "Number",
                pattern:
                    /0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|[0-9]+(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?/,
            }),
            createToken({
                name: "String",
                pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
            }),
            createToken({
                name: "Punctuation",
                pattern: /[\[\]{}().,;:]/,
            }),
            createToken({
                name: "Operator",
                pattern:
                    /==|!=|<=|>=|\*\*|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|>>=|<<=|\/\/=|&&|\|\||<<|>>|<=|>=|[-+*/%&|^!=<>]=?|\?|:/,
            }),
            createToken({
                name: "Comment",
                pattern: /#[^\n]*/,
            }),
            createToken({
                name: "Boolean",
                pattern: /True|False/,
            }),
            createToken({
                name: "Null",
                pattern: /None/,
            }),
            createToken({
                name: "Identifier",
                pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
            }),
        ]),
        colors
    ),
} satisfies Record<string, Language>;

function lex_to_lang(lexer: Lexer, token_map: Record<string, Color>): Language {
    return (code: string) => {
        const lexer_result = lexer.tokenize(code);
        const tokens = lexer_result.tokens;
        for (const err of lexer_result.errors) {
            console.warn(`Lexer error: ${err.message}`);
        }
        return tokens.map((token) => ({
            content: token.image,
            token_type: token.tokenType.name,
            color:
                token_map[token.tokenType.name] ??
                panic(`No color for token type ${token.tokenType.name}`),
        }));
    };
}

type Language = (code: string) => {
    content: string;
    token_type: string;
    color: Color;
}[];
