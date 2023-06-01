import { Lexer, createToken } from "chevrotain";
import { Color } from "../color";
import { panic } from "functional-utilities";
import { splitString } from "../code_block/word_split";

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
    Error: new Color(255, 0, 0),
} as const;

const error_token = createToken({
    name: "Error",
    pattern: /[\s\S]/,
});

export const languages = {
    js: lex_to_lang(
        new Lexer([
            // Define token for whitespace
            createToken({
                name: "Whitespace",
                pattern: /\s+/,
            }),

            // Define token for comments
            createToken({
                name: "Comment",
                pattern: /\/\/.*/i, // Matches single-line comments starting with "//"
            }),
            createToken({
                name: "MultilineComment",
                pattern: /\/\*[^]*?\*\//, // Matches multiline comments enclosed in "/* */"
            }),

            // Define token for strings
            createToken({
                name: "String",
                pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
            }),

            // Define token for numbers
            createToken({
                name: "Number",
                pattern:
                    /0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|[0-9]+(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?/,
            }),

            // Define token for punctuation
            createToken({
                name: "Punctuation",
                pattern: /[\[\]{}().,:]/,
            }),

            // Define token for operators
            createToken({
                name: "Operator",
                pattern:
                    /\+\+|;|--|=>|&&|\|\||<<|>>|<=|>=|==|!=|[-+*/%&|^!=<>]=?|\?|:/,
            }),

            // Define token for boolean values
            createToken({
                name: "Boolean",
                pattern: /true|false/,
            }),

            // Define token for null value
            createToken({
                name: "Null",
                pattern: /null/,
            }),

            // Define token for undefined value
            createToken({
                name: "Undefined",
                pattern: /undefined/,
            }),

            // Define token for identifiers
            createToken({
                name: "Identifier",
                pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
            }),

            error_token,
        ]),
        colors,
        [
            "break",
            "case",
            "catch",
            "class",
            "const",
            "continue",
            "debugger",
            "default",
            "delete",
            "do",
            "else",
            "export",
            "extends",
            "finally",
            "for",
            "function",
            "if",
            "import",
            "in",
            "instanceof",
            "new",
            "return",
            "super",
            "switch",
            "this",
            "throw",
            "try",
            "typeof",
            "var",
            "void",
            "while",
            "with",
            "yield",
        ]
    ),
    ts: lex_to_lang(
        new Lexer([
            // Define token for whitespace
            createToken({
                name: "Whitespace",
                pattern: /\s+/,
            }),

            // Define token for comments
            createToken({
                name: "Comment",
                pattern: /\/\/.*/i, // Matches single-line comments starting with "//"
            }),
            createToken({
                name: "MultilineComment",
                pattern: /\/\*[^]*?\*\//, // Matches multiline comments enclosed in "/* */"
            }),

            // Define token for strings
            createToken({
                name: "String",
                pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
            }),

            // Define token for numbers
            createToken({
                name: "Number",
                pattern:
                    /0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|[0-9]+(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?/,
            }),

            // Define token for punctuation
            createToken({
                name: "Punctuation",
                pattern: /[\[\]{}().,:]/,
            }),

            // Define token for operators
            createToken({
                name: "Operator",
                pattern:
                    /\+\+|;|--|=>|&&|\|\||<<|>>|<=|>=|==|!=|[-+*/%&|^!=<>]=?|\?|:/,
            }),

            // Define token for boolean values
            createToken({
                name: "Boolean",
                pattern: /true|false/,
            }),

            // Define token for null value
            createToken({
                name: "Null",
                pattern: /null/,
            }),

            // Define token for undefined value
            createToken({
                name: "Undefined",
                pattern: /undefined/,
            }),

            // Define token for identifiers
            createToken({
                name: "Identifier",
                pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
            }),

            error_token,
        ]),
        colors,
        [
            "break",
            "case",
            "catch",
            "class",
            "const",
            "continue",
            "debugger",
            "default",
            "delete",
            "do",
            "else",
            "export",
            "extends",
            "finally",
            "for",
            "function",
            "if",
            "import",
            "in",
            "instanceof",
            "new",
            "return",
            "super",
            "switch",
            "this",
            "throw",
            "try",
            "typeof",
            "var",
            "void",
            "while",
            "with",
            "yield",
            "abstract",
            "as",
            "asserts",
            "await",
            "implements",
            "interface",
            "is",
            "keyof",
            "module",
            "namespace",
            "readonly",
            "require",
            "static",
            "type",
            "unique",
        ]
    ),
    rust: lex_to_lang(
        new Lexer([
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

            error_token,
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

            error_token,
        ]),
        colors
    ),
} satisfies Record<string, Language>;

function lex_to_lang(
    lexer: Lexer,
    token_map: Record<string, Color>,
    keywords: string[] = []
): Language {
    return (code: string) => {
        const lexer_result = lexer.tokenize(code);
        const tokens = lexer_result.tokens;
        for (const err of lexer_result.errors) {
            console.warn(`Lexer error: ${err.message}`);
        }
        return tokens
            .map((token) => ({
                content: token.image,
                token_type: token.tokenType.name,
            }))
            .map((token) => {
                if (
                    token.token_type === "Identifier" &&
                    keywords.includes(token.content)
                ) {
                    token.token_type = "Keyword";
                }
                return {
                    ...token,
                    color:
                        token_map[token.token_type] ??
                        panic(`No color for token type ${token.token_type}`),
                };
            })
            .flatMap((token) => {
                return splitString(token.content).map((content) => ({
                    ...token,
                    content,
                }));
            });
    };
}

type Language = (code: string) => {
    content: string;
    token_type: string;
    color: Color;
}[];
