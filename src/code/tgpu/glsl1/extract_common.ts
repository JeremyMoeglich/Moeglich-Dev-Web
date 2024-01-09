import type { GlslExpression, GlslFullType, GlslStatement } from ".";
import { SHA256 } from "crypto-js";
import { infer_glsl_type } from "./infer_type";
import { panic } from "functional-utilities";

function get_subexpressions(expr: GlslExpression): GlslExpression[] {
    switch (expr.type) {
        case "binary_operation":
            return [expr.left, expr.right];
        case "function_call":
            return expr.arguments;
        case "variable":
            return [];
        case "literal":
            return [];
        case "unary_operation":
            return [expr.operand];
        case "array_access":
            return [expr.array, expr.index];
        case "swizzle":
            return [expr.vector];
    }
}

function hash(value: unknown): string {
    const serial = JSON.stringify(value);
    const hashed = SHA256(serial).toString();
    return hashed;
}

class TrieNode {
    children: Map<string, TrieNode>;
    count: number;

    constructor() {
        this.children = new Map<string, TrieNode>();
        this.count = 0;
    }
}

class Trie {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    insert(word: string): void {
        let node = this.root;
        for (const char of word) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char)!;
            node.count += 1;
        }
    }

    findShortestUniquePrefix(word: string): string {
        let node = this.root;
        let prefix = "";
        for (const char of word) {
            prefix += char;
            node = node.children.get(char)!;
            if (node.count === 1) {
                return prefix;
            }
        }
        return word; // Fallback to the full word if no unique prefix is found
    }
}

export function trimStringsForUniqueness(strings: string[]): string[] {
    const trie = new Trie();
    for (const string of strings) {
        trie.insert(string);
    }

    return strings.map((string) => trie.findShortestUniquePrefix(string));
}

function replace_inplace(
    original: GlslExpression,
    replacement: GlslExpression,
) {
    for (const key in original) {
        delete (original as Record<string, unknown>)[key];
    }
    for (const key in replacement) {
        (original as Record<string, unknown>)[key] = (
            replacement as Record<string, unknown>
        )[key];
    }
}

export function take_unique_var(
    vars: Map<string, GlslFullType>,
    hash: string,
    type: GlslFullType,
): string {
    const prefix = "var";
    let current = hash.slice(0, 1);
    while (vars.has(prefix + current)) {
        current += hash.slice(0, current.length + 1);
    }
    vars.set(prefix + current, type);
    return prefix + current;
}

function take_non_expressions(expr: GlslExpression): unknown {
    switch (expr.type) {
        case "literal":
            return expr;
        case "variable":
            return expr;
        case "binary_operation":
            return {
                type: expr.type,
                operation: expr.operation,
            };
        case "unary_operation":
            return {
                type: expr.type,
                operation: expr.operation,
            };
        case "function_call":
            return {
                type: expr.type,
                name: expr.name,
            };
        case "array_access":
            return {
                type: expr.type,
            };
    }
}

export function extract_common_expressions(
    vars: Map<string, GlslFullType>,
    expr: GlslExpression,
): {
    statements: GlslStatement[];
    output_expr: GlslExpression;
} {
    const expr_data = new Map<
        string,
        {
            count: number;
            actual: GlslExpression;
            original_ref: GlslExpression;
            name?: string;
        }
    >();
    const statements: GlslStatement[] = [];
    function extract(expr: GlslExpression): string {
        const subexprs = get_subexpressions(expr);
        const hashes = [];
        for (const subexpr of subexprs) {
            const hash = extract(subexpr);
            hashes.push(hash);
        }
        hashes.push(take_non_expressions(expr));
        const expr_hash = hash(hashes);

        if (expr.type !== "variable" && expr.type !== "literal") {
            const entry = expr_data.get(expr_hash);
            if (entry) {
                entry.count++;
                if (entry.count === 2) {
                    const type = infer_glsl_type(vars, entry.actual);
                    entry.name = take_unique_var(vars, expr_hash, type);
                    replace_inplace(entry.original_ref, {
                        type: "variable",
                        name: entry.name,
                    });
                    statements.push({
                        type: "variable_declaration",
                        name: entry.name,
                        initializer: entry.actual,
                        invariant: false,
                        variable_type: type,
                    });
                }
                replace_inplace(expr, {
                    type: "variable",
                    name: entry.name ?? panic("No name"),
                });
            } else {
                expr_data.set(expr_hash, {
                    count: 1,
                    actual: { ...expr },
                    original_ref: expr,
                });
            }
        }
        return expr_hash;
    }
    extract(expr);
    return {
        statements,
        output_expr: expr,
    };
}
