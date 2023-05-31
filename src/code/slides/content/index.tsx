import { InterpolatorStage } from "~/code/funcs/interpolator";
import { AspectSlide, TitleSlide } from "./basic_slides";
import type { Stage } from "../stage";
import { defaults } from "../defaults";
import { Point, RectSolid, ShapeSet } from "~/code/shapelib";
import { useTextShape } from "~/code/shapelib/funcs/use_text";
import { CodeBlock } from "~/code/funcs/code_block";
import { dedent } from "~/utils/dedent";
import { ShapeRender } from "~/code/shapelib/funcs/shape_render";
import { useAnimationFrame } from "~/utils/use_update";
import { CurveSet } from "~/code/shapelib/types/curve_set";
import { motion } from "framer-motion";

function interpolate_between(t: number, a: number, b: number) {
    const range = b - a;
    const phase = (Math.sin(t * Math.PI) + 1) / 2;
    return a + range * phase;
}

export const stages: Stage[] = [
    TitleSlide({
        title: "Abstraktion in der Programmierung",
        animateId: "title",
        titleColor: "sunsetGradient",
    }),
    AspectSlide({
        title: ["Was ist", " ", "Abstraktion", " ", "?"],
        aspects: [
            "Eine Vereinfachte Darstellung von etwas komplexem",
            "Eine Wiederverwendbare Lösung für ein Problem",
        ],
        animateId: "title",
        titleColor: "sunsetGradient",
    }),
    InterpolatorStage({
        Component: ({
            text_scale,
            offsetx,
            bbox_opacity,
            show_debug,
            code_opacity,
        }) => {
            const time = useAnimationFrame();
            const offset = new Point(offsetx, 0);
            const text = useTextShape("Hello World!")
                .recenter("both")
                .scale(0.06 * text_scale)
                .translate(offset);
            const full_beziers = text.shapes.flatMap((shape) =>
                shape
                    .all_shapes()
                    .flatMap((shape) => [
                        ...shape.fullBeziers().curves,
                        ...shape.fullBeziers().curves.map((fb) => fb),
                    ])
            );
            const text_bbox = text.bbox();
            const line_y = interpolate_between(
                time / 1000,
                text_bbox.y,
                text_bbox.y + text_bbox.height
            );
            const left_line_point = new Point(text_bbox.x - 0.1, line_y);
            const intersecting = full_beziers.filter(
                (bezier) =>
                    bezier.right_point_intersections(left_line_point) > 0
            );
            const samples = bbox_opacity === 0 ? [] : new RectSolid(-300, -300, 600, 600).translate(
                new Point(
                    interpolate_between(time / 3000, -200, 1200),
                    0
                )
            ).distribute_grid(2000).map((point) => {
                return [point, text.contains(point, 0)] as const;
            });
            const bboxes = full_beziers.map((bezier) => bezier.bbox());
            return (
                <div className="h-full">
                    {defaults.title(["Was ist", " ", "Abstraktion", " ", "?"])}
                    <div className="flex h-full items-center justify-evenly gap-16 text-white">
                        <div className="relative w-16">
                            <ShapeRender
                                instructions={[
                                    {
                                        action: show_debug ? "outline" : "both",
                                        obj: text,
                                        ctx_setter: (ctx) => {
                                            ctx.fillStyle = "white";
                                        },
                                        debug: show_debug,
                                        z_index: 0,
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
                                        z_index: 1,
                                    },
                                    {
                                        action: "outline",
                                        obj: new CurveSet(intersecting),
                                        ctx_setter: (ctx) => {
                                            ctx.strokeStyle = "red";
                                            ctx.lineWidth = 1;
                                            ctx.globalAlpha = bbox_opacity;
                                        },
                                        debug: show_debug,
                                        z_index: 2,
                                    },
                                    {
                                        action: "fill",
                                        obj: new ShapeSet(
                                            samples
                                                .filter(([, is_inside]) => {
                                                    return is_inside;
                                                })
                                                .map(([point]) => {
                                                    return point.to_circle_solid(
                                                        10
                                                    );
                                                })
                                        ),
                                        ctx_setter: (ctx) => {
                                            ctx.fillStyle = "red";
                                            ctx.globalAlpha = bbox_opacity;
                                        },
                                        z_index: 3,
                                    },
                                    {
                                        action: "fill",
                                        obj: new ShapeSet(
                                            samples
                                                .filter(([, is_inside]) => {
                                                    return !is_inside;
                                                })
                                                .map(([point]) => {
                                                    return point.to_circle_solid(
                                                        10
                                                    );
                                                })
                                        ),
                                        ctx_setter: (ctx) => {
                                            ctx.fillStyle = "blue";
                                            ctx.globalAlpha = bbox_opacity;
                                        },
                                        z_index: 3,
                                    },
                                ]}
                                render_id="abstraction"
                            />
                        </div>
                        <div>
                            <motion.div style={{ opacity: code_opacity }} className="relative right-48" layoutId="slide_codeblock">
                                <CodeBlock
                                    code={dedent`
                                    print("Hello World!")
                                `}
                                    language="python"
                                    animateId="codeblock1"
                                    scale={2.7}
                                />
                            </motion.div>
                        </div>
                    </div>
                </div >
            );
        },
        props_list: [
            {
                text_scale: 1,
                offsetx: 330,
                bbox_opacity: 0,
                show_debug: false,
                code_opacity: 0,
            },
            {
                text_scale: 5,
                offsetx: 0,
                bbox_opacity: 1,
                show_debug: true,
                code_opacity: 0,
            },
            {
                text_scale: 1,
                offsetx: -80,
                bbox_opacity: 0,
                show_debug: false,
                code_opacity: 1,
            },
        ],
        switch_duration: 1000,
    }),
    InterpolatorStage({
        Component: ({ code }) => {
            return <div className="flex justify-center items-center h-full">
                <motion.div layoutId="slide_codeblock">
                    <CodeBlock animateId="codeblock1" code={code} language="python" scale={2.7} />
                </motion.div>
            </div>
        },
        props_list: [
            {
                code: dedent`print("Hello World!")`,
            },
            {
                code: dedent`
                print("Hello Jeremy!")
                print("Hello Test!")
                print("Hello World!")
                print("Hello Universe!")
                print("Hello Galaxy!")
                `
            },
            {
                code: dedent`
                def greet(name):
                    return "Hello {name}!"
                    
                greet("Jeremy")
                greet("Test")
                greet("World")
                greet("Universe")
                greet("Galaxy")
                `
            }
        ],
        switch_duration: 1000,
    })
];
