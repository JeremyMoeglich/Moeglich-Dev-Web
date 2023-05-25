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
        Component: ({ text_scale, offset, bbox_opacity, show_debug }) => {
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
                <div>
                    {defaults.title("Abstraktion")}
                    <ShapeRender
                        width={1000}
                        height={500}
                        instructions={[
                            {
                                action: "fill",
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
                </div>
            );
        },
        props_list: [
            {
                text_scale: 1,
                offset: new Point(0, 0),
                bbox_opacity: 0,
                show_debug: false,
            },
            {
                text_scale: 5,
                offset: new Point(0, 0),
                bbox_opacity: 1,
                show_debug: true,
            },
            {
                text_scale: 2,
                offset: new Point(0, 0),
                bbox_opacity: 1,
            },
        ],
        switch_duration: 1000,
    }),
    AspectSlide({
        title: "Variables",
        aspects: [
            "What is a variable?",
            "How do I declare a variable?",
            "How do I assign a value to a variable?",
        ],
        animateId: "c1",
    }),
    InterpolatorStage({
        switch_duration: 1000,
        Component: ({ size }) => {
            return (
                <div
                    style={{
                        width: size,
                        height: size,
                        backgroundColor: "red",
                        borderRadius: "50%",
                        margin: "auto",
                        fontSize: "2rem",
                    }}
                />
            );
        },
        props_list: [
            {
                size: 100,
            },
            {
                size: 200,
            },
            {
                size: 300,
            },
        ],
    }),
];
