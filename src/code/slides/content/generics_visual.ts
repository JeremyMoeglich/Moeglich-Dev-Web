import { createBundle } from "~/code/bundle";
import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { shape_interface } from "./commons";
import { Text } from "~/code/shapelib/types/text";
import { zerozero } from "~/code/shapelib/types/point";

export function generics_visual() {
    return new InterFunc(({ t }: { t: number }) => {
        return createBundle([
            new Text(
                shape_interface({
                    color: true,
                    is_inside: true,
                    variant: "interface",
                }),
                zerozero,
                20
            ).highlight("ts"),
        ]);
    });
}
