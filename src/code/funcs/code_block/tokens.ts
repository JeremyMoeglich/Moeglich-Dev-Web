import type { Point } from "~/code/shapelib";
import type { Color } from "../color";

export interface Token {
    position: Point; // position in the code block
    x_index: number; // index in line, different from x as tokens can have different lengths
    content: string; // the token itself
    token_type: string; // the type of token for example IDENT
    color: Color; // the color of the token
}

export interface KeyedToken extends Token {
    key: string;
}
