import { dedent } from "~/utils/dedent";

export const shape_interface = dedent`
interface Shape {
    is_inside(p: Point): boolean;
}
`