import { maybe_global } from "functional-utilities";

const maybe_document = maybe_global("document");

const canvas = maybe_document?.createElement("canvas");
const ctx = canvas?.getContext("2d");
const textSizeCache = new Map<string, Map<string, number>>();

function isFontLoaded(fontFamily: string): boolean {
    const fontFaceSet = maybe_document?.fonts;
    return !!fontFaceSet && fontFaceSet.check(`16px ${fontFamily}`);
}

export function measureText(
    text: string,
    fontSize: number,
    fontFamily: string,
    skipFontCheck = false,
): { width: number; height: number } | undefined {
    if (!skipFontCheck && !isFontLoaded(fontFamily)) {
        return undefined;
    }

    if (!ctx) {
        return undefined;
    }

    const familyCache =
        textSizeCache.get(fontFamily) ?? new Map<string, number>();
    let baseWidth = familyCache?.get(text);

    if (typeof baseWidth === "undefined") {
        ctx.font = `16px ${fontFamily}`;
        const metrics = ctx.measureText(text);
        baseWidth = metrics.width;
        familyCache.set(text, baseWidth);
    }

    const scaledWidth = (fontSize / 16) * baseWidth;

    return {
        width: scaledWidth,
        height: fontSize * 1.5,
    };
}

export function getLargestCharSize(
    str: string,
    fontSize: number,
    fontFamily: string,
    skipFontCheck = false,
): { char: string; width: number; height: number } | undefined {
    if (!skipFontCheck && !isFontLoaded(fontFamily)) {
        return undefined;
    }

    let largestChar = "";
    let largestWidth = 0;

    for (const char of str) {
        const metrics = measureText(char, fontSize, fontFamily, true); // We skip the font check here if it was skipped initially
        if (!metrics) {
            continue;
        }

        if (metrics.width > largestWidth) {
            largestWidth = metrics.width;
            largestChar = char;
        }
    }

    return {
        char: largestChar,
        width: largestWidth,
        height: fontSize,
    };
}
