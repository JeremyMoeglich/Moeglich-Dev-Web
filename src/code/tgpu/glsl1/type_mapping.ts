import type { GlslFullType } from ".";


// prettier-ignore
export type MapGlslToLiteral<T extends GlslFullType> = 
        T extends { type: "void" } ? void :
        T extends { type: "bool" } ? boolean :
        T extends { type: "int" } ? number :
        T extends { type: "bvec2" } ? [boolean, boolean] :
        T extends { type: "bvec3" } ? [boolean, boolean, boolean] :
        T extends { type: "bvec4" } ? [boolean, boolean, boolean, boolean] :
        T extends { type: "ivec2" } ? [number, number] :
        T extends { type: "ivec3" } ? [number, number, number] :
        T extends { type: "ivec4" } ? [number, number, number, number] :
        T extends { type: "float" } ? number :
        T extends { type: "vec2" } ? [number, number] :
        T extends { type: "vec3" } ? [number, number, number] :
        T extends { type: "vec4" } ? [number, number, number, number] :
        T extends { type: "mat2" } ? [[number, number], [number, number]] :
        T extends { type: "mat3" } ? [[number, number, number], [number, number, number], [number, number, number]] :
        T extends { type: "mat4" } ? [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]] :
        T extends { type: "sampler2D" } ? WebGLTexture :
        T extends { type: "samplerCube" } ? WebGLTexture :
    never;

