import { panic } from 'functional-utilities';

interface JoinConfig {
    gap?: number;
    padding?: 'single' | 'shared';
}

export function join_horizontal(strings: string[], config?: JoinConfig): string {
    if (strings.length === 0) {
        return '';
    }

    // Split each string into lines
    let splitStrings = strings.map(s => s.split('\n'));

    // Find the longest line in each string and pad each line to the maximum length in its string
    let paddedStringsAndMaxLengths = splitStrings.reduce((result, lines) => {
        let maxLength = Math.max(...lines.map(line => line.length));
        result.paddedStrings.push(lines.map(line => line.padEnd(maxLength, ' ')));
        result.maxLengths.push(maxLength);
        return result;
    }, { paddedStrings: [] as string[][], maxLengths: [] as number[] });

    let paddedStrings = paddedStringsAndMaxLengths.paddedStrings;
    let maxLengths = paddedStringsAndMaxLengths.maxLengths;

    // Determine the maximum number of lines
    let maxLines = Math.max(...paddedStrings.map(s => s.length));

    // Pad strings with fewer lines with empty lines
    paddedStrings = paddedStrings.map((lines, i) => {
        let padding = lines.length < maxLines ? ' '.repeat(maxLengths[i] ?? panic()) : null;
        return [...lines, ...(new Array(maxLines - lines.length)).fill(padding)];
    });

    // Transpose the array of strings to line up lines of the same index
    let transposed = (paddedStrings[0] ?? panic()).map((_, i) => paddedStrings.map(x => x[i] ?? panic()));

    // Add gap if needed
    if (config?.gap) {
        transposed = transposed.map(lines => lines.map(line => line + ' '.repeat(config.gap ?? 0)));
    }

    // Determine the max length for 'shared' padding
    if (config?.padding === 'shared') {
        let sharedPadding = Math.max(...maxLengths);
        transposed = transposed.map(lines => lines.map(line => line.padEnd(sharedPadding, ' ')));
    }

    // Join each array of lines into a single string, and join these strings with a newline
    return transposed.map(lines => lines.join('')).join('\n');
}
