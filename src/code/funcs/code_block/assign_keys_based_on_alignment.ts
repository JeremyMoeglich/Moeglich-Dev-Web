import { v4 as uuidv4 } from "uuid";
import type { KeyedToken, Token } from "./tokens";

export function assignKeysAndMinimizeMovement(
    previousSequences: KeyedToken[][],
    newSequences: Token[][],
    alignment: Array<[KeyedToken | null, Token | null]>
): KeyedToken[] {
    const keyedTokens: KeyedToken[] = [];

    // Create a copy of previous_sequences for easy lookup and manipulation
    const previousKeyedTokens: { [key: string]: KeyedToken } = {};
    for (const sequence of previousSequences) {
        for (const token of sequence) {
            previousKeyedTokens[token.key] = token;
        }
    }

    for (const pair of alignment) {
        const oldToken = pair[0];
        const newToken = pair[1];

        // If both tokens exist
        if (oldToken && newToken) {
            // If the previous token with the same key still exists
            if (previousKeyedTokens[oldToken.key]) {
                // Assign the new token the same key as the old token
                keyedTokens.push({
                    ...newToken,
                    key: oldToken.key,
                });
            } else {
                // If the previous token with the same key does not exist anymore, assign a new unique key to the new token
                keyedTokens.push({ ...newToken, key: uuidv4() });
            }
        }
        // If the new token exists and the old token does not
        else if (!oldToken && newToken) {
            // Assign a new unique key to the new token
            keyedTokens.push({ ...newToken, key: uuidv4() });
        }
        // If the new token does not exist and the old token does, do nothing (the old token is destroyed)
    }

    return keyedTokens;
}
