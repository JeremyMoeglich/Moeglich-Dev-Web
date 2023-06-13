import { createBundle } from "~/code/bundle";
import { shape_interface } from "./commons";
import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { Text } from "~/code/shapelib/types/text";
import { zerozero } from "~/code/shapelib/types/point";
import { align, table } from "~/code/shapelib/funcs/utils";
import { zip } from "functional-utilities";
import { RectSolid } from "~/code/shapelib";

const checkmark = new Text("✓", zerozero, 50);
const cross = new Text("✗", zerozero, 50);

export function extend_compare_visual() {
    return new InterFunc(({ t }: { t: number }) => {
        return table(
            [
                [
                    RectSolid.empty(),
                    new Text("Code", zerozero, 35).highlight("ts"),
                    new Text("Beschreibt die Form", zerozero, 30),
                    new Text("Standard Implementation", zerozero, 30),
                    new Text("Instanzierung", zerozero, 30),
                ],
                [
                    new Text("Interface", zerozero, 40),
                    new Text(
                        shape_interface({
                            color: true,
                            is_inside: true,
                            variant: "interface",
                        }),
                        zerozero,
                        20
                    ).highlight("ts"),
                    checkmark,
                    cross,
                    cross,
                ],
                [
                    new Text("Abstract Class", zerozero, 40),
                    new Text(
                        shape_interface({
                            color: true,
                            is_inside: true,
                            variant: "abstract_class",
                        }),
                        zerozero,
                        20
                    ).highlight("ts"),
                    checkmark,
                    checkmark,
                    cross,
                ],
                [
                    new Text("Class Inheritance", zerozero, 40),
                    new Text(
                        shape_interface({
                            color: true,
                            is_inside: true,
                            variant: "class",
                        }),
                        zerozero,
                        20
                    ).highlight("ts"),
                    checkmark,
                    checkmark,
                    checkmark,
                ],
            ],
            {
                gap: 50,
                orientation: "columns",
                x_size: 1700,
                y_size: 500,
            }
        );
    });
}
