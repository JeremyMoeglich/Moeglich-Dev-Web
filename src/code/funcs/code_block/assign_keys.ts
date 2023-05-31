import { KeyedToken, Token } from "./tokens";
import { identifySequences } from "./identify_sequences";
import { alignSequences } from "./align_sequences";
import {
    assignKeysAndMinimizeMovement,
    assignKeysBasedOnAlignment,
} from "./assign_keys_based_on_alignment";
import { minimizeMovement } from "./minimize_movement";

export function assignKeys(
    previous_tokens: KeyedToken[],
    new_tokens: Token[]
): KeyedToken[] {
    // Step 1: Identify multi-token sequences.
    const previousSequences = identifySequences(previous_tokens);
    const newSequences = identifySequences(new_tokens);

    // Step 2: Align the sequences.
    const alignment = alignSequences(previousSequences, newSequences);

    // Step 3: Assign keys based on the alignment.
    const keyedTokens = assignKeysAndMinimizeMovement(
        previousSequences,
        newSequences,
        alignment
    );

    return keyedTokens;
}
