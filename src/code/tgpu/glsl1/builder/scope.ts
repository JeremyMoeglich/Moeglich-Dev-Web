import { GlslFullType, GlslStatement } from "..";

export type BuildScope = {
    vars: Map<string, GlslFullType>;
    statements: GlslStatement[];
}