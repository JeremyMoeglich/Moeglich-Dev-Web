export function build_glsl_identifier(identifier: string, reserved: string[]): string {
    function cast_char_to_valid_char(char: string): string {
        if (char.match(/[a-zA-Z0-9_]/)) {
            return char;
        }
        return `${char.charCodeAt(0).toString(16).toUpperCase()}`;
    }

    const new_string = identifier
        .split("")
        .map(cast_char_to_valid_char)
        .join("");
    if (reserved.includes(new_string)) {
        return `_${new_string}`;
    }

    if (new_string.startsWith("gl_")) {
        return `_${new_string}`;
    }

    if (new_string?.[0]?.match(/[0-9]/)) {
        return `_${new_string}`;
    }

    if (new_string.startsWith("__")) {
        if (["__LINE__", "__FILE__", "__VERSION__"].includes(new_string)) {
            return new_string;
        } else {
            return `var${new_string}`;
        }
    }

    return new_string;
}