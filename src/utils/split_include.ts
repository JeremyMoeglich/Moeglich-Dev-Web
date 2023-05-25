export function split_include(str: string, separator: string): string[] {
    const splitStr = str.split(separator);
    for (let i = splitStr.length - 1; i > 0; i--) {
        splitStr.splice(i, 0, separator);
    }
    return splitStr;
}