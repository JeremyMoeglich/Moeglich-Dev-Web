import { Point } from "~/code/shapelib/types/point";
import { Text } from "~/code/shapelib/types/text";
import { sources, type SourceFile } from "~/code/sources";

const fileContentCache: Record<string, string> = {};
const fetching: Set<string> = new Set();

function fetchFileContent(sourceFile: SourceFile): void {
    if (fetching.has(sourceFile.web_path)) {
        return;
    }
    fetching.add(sourceFile.web_path);
    fetch(sourceFile.web_path)
        .then((response) => response.text())
        .then((content) => {
            fileContentCache[sourceFile.web_path] = content;
        })
        .catch((error) => {
            console.error(
                `Failed to fetch file at path: ${sourceFile.web_path}`,
                error,
            );
            fetching.delete(sourceFile.web_path);
        });
}

if (typeof window !== "undefined") {
    for (const block of sources) {
        fetchFileContent(block);
    }
}

function generate_code(): string {
    let code = "";
    for (const block of sources) {
        const entry = fileContentCache[block.web_path];
        if (!entry) {
            code += `Loading ${block.web_path}...\n`;
            fetchFileContent(block);
        } else {
            code += `${entry}\n\n`;
        }
    }
    return code;
}

function cull_code(y_offset: number): [string, number] {
    // takes in a y offset and return the code along with the new y offset
    const code = generate_code();
    const lines = code.split("\n");
    const wrapped = y_offset % lines.length;
    const floor_y = Math.floor(wrapped);
    const required_lines = 80;
    const chosen = lines.slice(floor_y, floor_y + required_lines);
    return [chosen.join("\n"), wrapped - floor_y];
}

export function code_scroll_visual(t: number) {
    const y = t / 100;
    const text_height = 14;
    const line_height = 1.2;
    const [displayedText, wrappedY] = cull_code(y);
    const textElement = new Text(
        displayedText,
        new Point(0, -line_height * wrappedY * text_height),
        14,
        line_height,
    )
        .highlight("ts")
        .translate(new Point(-600, -500));

    return textElement;
}
