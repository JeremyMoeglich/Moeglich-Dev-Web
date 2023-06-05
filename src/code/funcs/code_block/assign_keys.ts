import { KeyedToken, Token } from "./tokens";
import { v4 as uuidv4 } from "uuid";

type Sequence = { previous: number[]; new: number[] };
type TokenMap = { [key: string]: Sequence[] };

function token_iden(token: Token): string {
    return `${token.token_type}:${token.content}`;
}

export function assignKeys(previous_tokens: KeyedToken[], new_tokens: Token[]): KeyedToken[] {
    const identicalTokenMap: { [id: string]: Sequence[] } = {};
    const startIndexMap: { [id: string]: Sequence[] } = {};

    // This will track which tokens have been used in a sequence
    const usedPrevTokens = new Array(previous_tokens.length).fill(false);
    const usedNewTokens = new Array(new_tokens.length).fill(false);

    // Identify identical tokens and form initial sequences of length 1
    previous_tokens.forEach((token, i) => {
        const id = token_iden(token);
        new_tokens.forEach((newToken, j) => {
            if (!usedPrevTokens[i] && !usedNewTokens[j] && id === token_iden(newToken)) {
                const sequence: Sequence = { previous: [i], new: [j] };
                identicalTokenMap[id] = identicalTokenMap[id] ? [...identicalTokenMap[id], sequence] : [sequence];
                startIndexMap[id] = identicalTokenMap[id];
                // Mark the tokens as used
                usedPrevTokens[i] = true;
                usedNewTokens[j] = true;
            }
        });
    });

    // Extend sequences
    let sequencesCanBeExtended = true;
    while (sequencesCanBeExtended) {
        sequencesCanBeExtended = false;
        for (const id in identicalTokenMap) {
            identicalTokenMap[id].forEach(sequence => {
                const lastIndexOfPrev = sequence.previous[sequence.previous.length - 1];
                const lastIndexOfNew = sequence.new[sequence.new.length - 1];
                if (lastIndexOfPrev + 1 < previous_tokens.length && lastIndexOfNew + 1 < new_tokens.length) {
                    const nextIdPrev = token_iden(previous_tokens[lastIndexOfPrev + 1]);
                    const nextIdNew = token_iden(new_tokens[lastIndexOfNew + 1]);
                    if (!usedPrevTokens[lastIndexOfPrev + 1] && !usedNewTokens[lastIndexOfNew + 1] && nextIdPrev === nextIdNew && startIndexMap[nextIdPrev]) {
                        startIndexMap[nextIdPrev].forEach(nextSequence => {
                            if (nextSequence.previous[0] === lastIndexOfPrev + 1 && nextSequence.new[0] === lastIndexOfNew + 1) {
                                // Extend the sequence
                                sequence.previous.push(lastIndexOfPrev + 1);
                                sequence.new.push(lastIndexOfNew + 1);
                                // Remove the extended sequence from the startIndexMap
                                startIndexMap[nextIdPrev] = startIndexMap[nextIdPrev].filter(seq => seq !== nextSequence);
                                // Mark the tokens as used
                                usedPrevTokens[lastIndexOfPrev + 1] = true;
                                usedNewTokens[lastIndexOfNew + 1] = true;
                                sequencesCanBeExtended = true;
                            }
                        });
                    }
                }
            });
        }
    }

    // Assign keys
    const keyedNewTokens: KeyedToken[] = new_tokens.map(token => ({ ...token, key: uuidv4() }));
    for (const id in identicalTokenMap) {
        identicalTokenMap[id].forEach(sequence => {
            sequence.new.forEach((index, i) => {
                keyedNewTokens[index].key = previous_tokens[sequence.previous[i]].key;
            });
        });
    }

    return keyedNewTokens;
}
