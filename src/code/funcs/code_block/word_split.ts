export function splitString(input: string): string[] {
    // Regular expression that splits on space, or any punctuation that isn't directly connected to a word character
    const regex = /(\s|[.,!?;:](?!\w))/g;
    let result = input.split(regex);

    // Filter out empty strings caused by split function when there are successive delimiters.
    result = result.filter((str) => str !== "");

    return result;
}
