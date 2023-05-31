import { panic } from "functional-utilities";
import type { Token } from "./tokens";

export function identifySequences<T extends Token>(tokens: T[]): T[][] {
    const sequences: T[][] = [];
    let currentSequence: T[] = [];

    for (let i = 0; i < tokens.length; i++) {
        // If currentSequence is empty, add the first token to it.
        if (currentSequence.length === 0) {
            currentSequence.push(tokens[i] ?? panic());
        } else {
            // If the current token has the same type as the last token in the currentSequence, add it to currentSequence.
            if (
                (tokens[i] ?? panic()).token_type ===
                (currentSequence[currentSequence.length - 1] ?? panic())
                    .token_type
            ) {
                currentSequence.push(tokens[i] ?? panic());
            } else {
                // Else, add currentSequence to sequences, and start a new sequence with the current token.
                sequences.push(currentSequence);
                currentSequence = [tokens[i] ?? panic()];
            }
        }
    }

    // Add the last sequence to sequences
    if (currentSequence.length > 0) {
        sequences.push(currentSequence);
    }

    return sequences;
}
