import type { KeyedToken, Token } from "./tokens";
import { init_array, panic } from "functional-utilities";

export function alignSequences(
    previousSequences: Token[][],
    newSequences: Token[][]
): Array<[KeyedToken | null, Token | null]> {
    // Function to calculate alignment score.
    function score(a: Token, b: Token): number {
        if (a.token_type === b.token_type && a.content === b.content) {
            return 2; // Increase score if both type and content match.
        } else if (a.token_type === b.token_type) {
            return 1; // Increase score if only type matches.
        }
        return 0; // No match, no score.
    }

    const sequencePairs: Array<[Token | null, Token | null]> = [];

    // Flatten the arrays for simplicity.
    const previousTokens: Token[] = previousSequences.reduce(
        (a, b) => a.concat(b),
        []
    );
    const newTokens: Token[] = newSequences.reduce((a, b) => a.concat(b), []);

    // Initialize Needleman-Wunsch matrix.
    const matrix: number[][] = init_array(0, [
        previousTokens.length + 1,
        newTokens.length + 1,
    ]);

    // Fill out the first row and first column of the matrix.
    for (const [i, row] of matrix.entries()) {
        row[0] = i * -1;
    }
    for (let j = 0; j <= newTokens.length; j++) {
        (matrix[0] ?? panic())[j] = j * -1;
    }

    // Populate the matrix with alignment scores.
    for (let i = 1; i <= previousTokens.length; i++) {
        for (let j = 1; j <= newTokens.length; j++) {
            const match =
                matrix[i - 1][j - 1] +
                score(previousTokens[i - 1], newTokens[j - 1]);
            const deleteOld = matrix[i - 1][j] - 1;
            const insertNew = matrix[i][j - 1] - 1;
            matrix[i][j] = Math.max(match, deleteOld, insertNew);
        }
    }

    // Trace back through the matrix to determine the optimal alignment.
    let i = previousTokens.length;
    let j = newTokens.length;
    while (i > 0 && j > 0) {
        if (
            matrix[i][j] ===
            matrix[i - 1][j - 1] +
                score(previousTokens[i - 1], newTokens[j - 1])
        ) {
            sequencePairs.unshift([previousTokens[i - 1], newTokens[j - 1]]);
            i--;
            j--;
        } else if (matrix[i][j] === matrix[i - 1][j] - 1) {
            sequencePairs.unshift([previousTokens[i - 1], null]);
            i--;
        } else {
            sequencePairs.unshift([null, newTokens[j - 1]]);
            j--;
        }
    }

    // Add remaining tokens, if any.
    while (i > 0) {
        sequencePairs.unshift([previousTokens[i - 1], null]);
        i--;
    }
    while (j > 0) {
        sequencePairs.unshift([null, newTokens[j - 1]]);
        j--;
    }

    return sequencePairs;
}
