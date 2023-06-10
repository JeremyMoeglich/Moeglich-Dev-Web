import { type Interpolate, InterpolatorStage } from "~/code/funcs/interpolator";
import { AspectSlide, TitleSlide } from "./basic_slides";
import type { Stage } from "../stage";
import { defaults } from "../defaults";
import {
    CircleSolid,
    Point,
    RectSolid,
    type Transformable,
} from "~/code/shapelib";
import { useTextShape } from "~/code/shapelib/funcs/use_text";
import { CodeBlock } from "~/code/funcs/code_block";
import { dedent } from "~/utils/dedent";
import { ShapeRender } from "~/code/shapelib/funcs/shape_render";
import { useAnimationFrame } from "~/utils/use_update";
import { motion } from "framer-motion";
import type { languages } from "~/code/funcs/lex";
import { type Bundle, createBundle, emptyBundle } from "~/code/bundle";
import { type Renderable } from "~/code/shapelib/types/interfaces/renderable";

const empty_render: Bundle<Renderable & Interpolate & Transformable> =
    emptyBundle(CircleSolid.empty());

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
            const full_beziers = text.objs.flatMap((obj) =>
                obj
                    .all_shapes()
                    .flatMap((shape) => [
                        ...shape.fullBeziers().objs,
                        ...shape.fullBeziers().objs.map((fb) => fb),
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
            const samples =
                bbox_opacity === 0
                    ? []
                    : new RectSolid(-300, -300, 600, 600)
                          .translate(
                              new Point(
                                  interpolate_between(time / 3000, -200, 1200),
                                  0
                              )
                          )
                          .distribute_grid(2000)
                          .map((point) => {
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
                                        obj: createBundle(bboxes),
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
                                        obj: createBundle(intersecting),
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
                                        obj: createBundle(
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
                                        obj: createBundle(
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
                            <motion.div
                                style={{ opacity: code_opacity }}
                                layoutId="slide_codeblock"
                            >
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
                </div>
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
        Component: ({
            code,
            language,
            scale,
            offsety,
            title,
            visual,
            xgap,
            static_props,
        }) => {
            return (
                <div className="h-full">
                    {defaults.title(title)}
                    <div className="flex h-full items-center justify-center">
                        <motion.div
                            layoutId="shape_render"
                            className="relative"
                        >
                            <ShapeRender
                                render_id="abstraction"
                                instructions={[
                                    {
                                        action: "fill",
                                        obj: visual.translate(
                                            new Point(xgap / 2, 0)
                                        ),
                                        ctx_setter: (ctx) => {
                                            ctx.fillStyle = "white";
                                        },
                                        z_index: 0,
                                    },
                                ]}
                            />
                        </motion.div>
                        <motion.div
                            layoutId="slide_codeblock"
                            style={{
                                top: `${offsety}px`,
                                position: "relative",
                                right: `${static_props.xgap / 2}px`,
                            }}
                        >
                            <CodeBlock
                                animateId="codeblock1"
                                code={code}
                                language={language}
                                scale={scale}
                            />
                        </motion.div>
                    </div>
                </div>
            );
        },
        props_list: [
            {
                code: dedent`print("Hello World!")`,
                language: "python",
                scale: 2.7,
                offsety: 0,
                title: "Abstraktion - Funktionen",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                print("Hello Jeremy!")
                print("Hello Test!")
                print("Hello World!")
                print("Hello Philipp!")
                print("Hello Possibilities!")
                `,
                language: "python",
                scale: 2.7,
                offsety: 0,
                title: "Abstraktion - Funktionen",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                def greet(name):
                    print("Hello {name}!")
                    
                greet("Jeremy")
                greet("Test")
                greet("World")
                greet("Philipp")
                greet("Possibilities")
                `,
                language: "python",
                scale: 2.7,
                offsety: 0,
                title: "Abstraktion - Funktionen",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                def get_price(prices):
                    total = 0
                    for price in prices:
                        total += price
                    return total

                print(get_price([1, 2, 3, 4, 5]))
                `,
                language: "python",
                scale: 2.7,
                offsety: 0,
                title: "Abstraktion - Funktionen",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                print(get_price([1, 2, 3, 4, 5]))
                `,
                language: "python",
                scale: 2.7,
                offsety: 0,
                title: "Abstraktion - Funktionen",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                def get_price(prices):
                    total = 0
                    for price in prices:
                        total += price
                    return total

                print(get_price([1, 2, 3, 4, 5]))
                `,
                language: "python",
                scale: 2.7,
                offsety: 0,
                title: "Abstraktion - Funktionen",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                function get_price(prices) {
                    let total = 0;
                    for (const price of prices) {
                        total += price;
                    }
                    return total;
                }

                console.log(get_price([1, 2, 3, 4, 5]));
                `,
                language: "js",
                scale: 2.5,
                offsety: 0,
                title: "Abstraktion - Funktionen",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                function get_price(prices: number[]): number {
                    let total = 0;
                    for (const price of prices) {
                        total += price;
                    }
                    return total;
                }

                console.log(get_price([1, 2, 3, 4, 5]));
                `,
                language: "ts",
                scale: 2,
                offsety: 0,
                title: "Abstraktion - Types",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                type Product = {
                    name: string,
                    price: number,
                }

                function get_price(products: Product[]): number {
                    let total = 0;
                    for (const product of products) {
                        total += product.price;
                    }
                    return total;
                }

                console.log(get_price([
                    { name: "Apple", price: 1 },
                    { name: "Banana", price: 2 },
                    { name: "Orange", price: 3 },
                ]));
                `,
                language: "ts",
                scale: 2,
                offsety: 0,
                title: "Abstraktion - Types",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                type Circle = {
                    x: number,
                    y: number,
                    radius: number,
                }
                `,
                language: "ts",
                scale: 3,
                offsety: 0,
                title: "Abstraktion - Types",
                visual: createBundle([
                    new CircleSolid(new Point(0, 0), 100).set_setter((ctx) => {
                        ctx.fillStyle = "red";
                    }),
                ]),
                xgap: 700,
            },
            {
                code: dedent`
                type Point = {
                    x: number,
                    y: number,
                }
                
                type Circle = {
                    x: number,
                    y: number,
                    radius: number,
                }
                `,
                language: "ts",
                scale: 2.6,
                offsety: 0,
                title: "Abstraktion - Types",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                type Point = {
                    x: number,
                    y: number,
                }
                
                type Circle = {
                    x: number,
                    y: number,
                    radius: number,
                }

                function is_inside_circle(circle: Circle, point: Point): boolean {
                    const dx = circle.x - point.x;
                    const dy = circle.y - point.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance < circle.radius;
                }
                `,
                language: "ts",
                scale: 2,
                offsety: 0,
                title: "Abstraktion - Types",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                console.log(is_inside_circle(
                    { x: 10, y: 20, radius: 5 },
                    { x: 15, y: 25 },
                )); // false
                `,
                language: "ts",
                scale: 2,
                offsety: 0,
                title: "Abstraktion - Types",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                type Point = {
                    x: number,
                    y: number,
                }
                
                type Circle = {
                    x: number,
                    y: number,
                    radius: number,
                }

                function is_inside_circle(circle: Circle, point: Point): boolean {
                    const dx = circle.x - point.x;
                    const dy = circle.y - point.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance < circle.radius;
                }
                `,
                language: "ts",
                scale: 2,
                offsety: 0,
                title: "Abstraktion - Types",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                type Point = {
                    x: number,
                    y: number,
                }

                class Circle {
                    x: number;
                    y: number;
                    radius: number;

                    constructor(x: number, y: number, radius: number) {
                        this.x = x;
                        this.y = y;
                        this.radius = radius;
                    }

                    is_inside(point: Point): boolean {
                        const dx = this.x - point.x;
                        const dy = this.y - point.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        return distance < this.radius;
                    }
                }
                `,
                language: "ts",
                offsety: 0,
                scale: 2,
                title: "Abstraktion - Klassen",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                const circle = new Circle(10, 20, 5);
                console.log(circle.is_inside({ x: 15, y: 25 })); // false
                `,
                language: "ts",
                offsety: 0,
                scale: 2.7,
                title: "Abstraktion - Klassen",
                visual: empty_render,
                xgap: 0,
            },
            {
                code: dedent`
                    // Ohne Klassen
                    console.log(is_inside_circle(
                        { x: 10, y: 20, radius: 5 },
                        { x: 15, y: 25 },
                    ));

                    // Mit Klassen
                    const circle = new Circle(10, 20, 5);
                    console.log(circle.is_inside({ x: 15, y: 25 }));
                    `,
                language: "ts",
                offsety: 0,
                scale: 2.5,
                title: "Abstraktion - Klassen",
                visual: empty_render,
                xgap: 0,
            },
        ] satisfies {
            code: string;
            language: keyof typeof languages;
            scale: number;
            offsety: number;
            title: string;
            visual: Bundle<Interpolate & Renderable & Transformable>;
            xgap: number;
        }[],
        switch_duration: 1000,
        disable: ["scale"],
    }),
];
