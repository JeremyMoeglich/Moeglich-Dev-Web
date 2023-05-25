import { InterpolatorStage } from "~/code/funcs/interpolator";
import { AspectSlide, TitleSlide } from "./basic_slides";
import type { Stage } from "../stage";
import { defaults } from "../defaults";
import { ShapeRender } from "~/code/shapelib/funcs/use_draw";
import { Point, ShapeSet } from "~/code/shapelib";
import { useTextShape } from "~/code/shapelib/funcs/use_text";

export const stages: Stage[] = [
    TitleSlide({
        title: "Abstraktion in der Programmierung",
        animateId: "title",
        titleColor: "sunsetGradient",
    }),
    InterpolatorStage({
        Component: ({
            text_scale,
            offset,
            bbox_opacity,
            show_debug,
            aspect_index,
        }) => {
            const text = useTextShape("Text")
                .scale(0.03 * text_scale)
                .offset(offset);
            const bboxes = text.shapes.flatMap((shape) =>
                shape
                    .all_shapes()
                    .flatMap((shape) => [
                        shape.bbox(),
                        ...shape.fullBeziers().map((fb) => fb.bbox()),
                    ])
            );
            return (
                <div className="h-full">
                    {defaults.title("Abstraktion")}
                    <div className="flex h-full items-center justify-center gap-16 text-white">
                        <ShapeRender
                            width={600}
                            height={300}
                            instructions={[
                                {
                                    action: "both",
                                    obj: text,
                                    ctx_setter: (ctx) => {
                                        ctx.fillStyle = "white";
                                    },
                                    debug: show_debug,
                                },
                                {
                                    action: "outline",
                                    obj: new ShapeSet(bboxes),
                                    ctx_setter: (ctx) => {
                                        ctx.strokeStyle = "blue";
                                        ctx.lineWidth = 1;
                                        ctx.globalAlpha = bbox_opacity;
                                    },
                                    debug: show_debug,
                                },
                            ]}
                        />
                        {defaults.aspects(
                            [
                                "Vereinfachung von Komplexität",
                                "Wiederverwendung von Lösungen",
                            ],
                            aspect_index
                        )}
                    </div>
                </div>
            );
        },
        props_list: [
            {
                text_scale: 1,
                offset: new Point(0, 0),
                bbox_opacity: 0,
                show_debug: false,
                aspect_index: 0,
            },
            {
                text_scale: 5,
                offset: new Point(0, 0),
                bbox_opacity: 1,
                show_debug: true,
                aspect_index: 1,
            },
            {
                text_scale: 2,
                offset: new Point(0, 0),
                bbox_opacity: 1,
                show_debug: false,
                aspect_index: 2,
            },
        ],
        switch_duration: 1000,
    }),
    TitleSlide({
        title: "Funktionen",
        animateId: "title",
        titleColor: "coolGradient",
        titleFontSize: "7rem",
    }),
];
