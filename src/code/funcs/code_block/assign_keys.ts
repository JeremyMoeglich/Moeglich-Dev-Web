import { KeyedToken, Token } from "./tokens";
import { identifySequences } from "./identify_sequences";
import { alignSequences } from "./align_sequences";
import {
    assignKeysAndMinimizeMovement,
} from "./assign_keys_based_on_alignment";
import { v4 } from "uuid";

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
    // Create a map for fast lookup
    const previousMap: Map<string, KeyedToken[]> = new Map();
    const usedKeys: Set<string> = new Set();
  
    for (let i = 0; i < previous_tokens.length; i++) {
      for (let j = i; j < previous_tokens.length; j++) {
        const sequence = previous_tokens.slice(i, j + 1);
        const identifier = sequence.map(t => t.content + t.token_type).join('|');
  
        if (previousMap.has(identifier)) {
          previousMap.get(identifier)!.push(...sequence);
        } else {
          previousMap.set(identifier, [...sequence]);
        }
      }
    }
  
    const keyed_tokens: KeyedToken[] = [];
    let i = 0;
    
    while (i < new_tokens.length) {
      for (let j = new_tokens.length; j > i; j--) {
        const sequence = new_tokens.slice(i, j);
        const identifier = sequence.map(t => t.content + t.token_type).join('|');
  
        if (previousMap.has(identifier)) {
          const previous_tokens = previousMap.get(identifier)!;
          let found = false;
          let minCost = Infinity;
          let minCostKeySequence: string[] = [];
  
          for (let k = 0; k < previous_tokens.length; k += sequence.length) {
            const keySequence = previous_tokens.slice(k, k + sequence.length).map(t => t.key);
            const uniqueKeys = new Set(keySequence);
            
            if (keySequence.length === uniqueKeys.size && 
                ![...uniqueKeys].some(key => usedKeys.has(key))) {
              // Calculate the cost of this sequence based on spatial proximity
              let cost = 0;
              sequence.forEach((t, index) => {
                cost += Math.abs(t.x - previous_tokens[k + index].x) + 
                        Math.abs(t.y - previous_tokens[k + index].y);
              });
  
              if (cost < minCost) {
                minCost = cost;
                minCostKeySequence = keySequence;
              }
            }
          }
  
          if (minCost < Infinity) {
            found = true;
            sequence.forEach((t, index) => {
              keyed_tokens.push({ ...t, key: minCostKeySequence[index] });
              usedKeys.add(minCostKeySequence[index]);
            });
            i = j;
          }
  
          if (found) {
            break;
          }
        }
  
        if (j === i + 1) {
          // No sequence found, assign a new key
          const key = v4();
          usedKeys.add(key);
          keyed_tokens.push({ ...new_tokens[i], key: key });
          i++;
        }
      }
    }
  
    return keyed_tokens;
  }