import { createBundle } from "~/code/bundle";
import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { package_visual } from "./package";

export function generics_visual() {
    return new InterFunc(({ t }: { t: number }) => {
        return createBundle([
            package_visual()
        ]);
    });
}
