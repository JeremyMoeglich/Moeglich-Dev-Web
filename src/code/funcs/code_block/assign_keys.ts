import { KeyedToken, Token } from "./tokens";
import { identifySequences } from "./identify_sequences";
import { alignSequences } from "./align_sequences";
import {
	assignKeysAndMinimizeMovement,
} from "./assign_keys_based_on_alignment";
import { v4 } from "uuid";
import { Point } from "~/code/shapelib";

// export function assignKeys(
//     previous_tokens: KeyedToken[],
//     new_tokens: Token[]
// ): KeyedToken[] {
//     // Step 1: Identify multi-token sequences.
//     const previousSequences = identifySequences(previous_tokens);
//     const newSequences = identifySequences(new_tokens);

//     // Step 2: Align the sequences.
//     const alignment = alignSequences(previousSequences, newSequences);

//     // Step 3: Assign keys based on the alignment.
//     const keyedTokens = assignKeysAndMinimizeMovement(
//         previousSequences,
//         newSequences,
//         alignment
//     );

//     return keyedTokens;
// }


export function assignKeys(previous_tokens: KeyedToken[], new_tokens: Token[]): KeyedToken[] {
	function token_iden(token: Token): string {
		return `${token.token_type}:${token.content}`;
	}

	const previous_token_map = new Map<string, KeyedToken[]>();
	const new_token_map = new Map<string, Token[]>();

	for (const token of previous_tokens) {
		if (token.key) {
			previous_token_map.set(token.key, token);
		}
	}

	for (const token of new_tokens) {
		new_token_map.set(token_iden(token), token);
	}

	const iden_matches = new Map<string, Token[]>();
	for (const [iden, token] of new_token_map) {
		const matches = previous_token_map.get(iden);
		if (matches) {
			iden_matches.set(iden, [matches, token]);
		}
	}

	const keyed = new_tokens.map(token => [token, undefined] as [Token, string | undefined]);

	for (const [iden, matches] of iden_matches) {
		
	}
}