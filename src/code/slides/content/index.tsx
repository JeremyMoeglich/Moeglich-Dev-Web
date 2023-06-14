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
import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { interpolate_between } from "~/utils/interpolate_between";
import { intersect_visual } from "./intersect_visual";
import { multi_shape_visual } from "./multi_shape";
import { basic_polymorphism } from "./basic_polymorphism";
import { end_visual } from "./food_visual";
import { generics_visual } from "./generics_visual";
import { product_visual } from "./products";
import { extend_compare_visual } from "./extend_compare_visual";
import { merge_code } from "~/code/merge_code";
import { shape_interface } from "./commons";
import { transforms_visual } from "./transforms_visual";
import { deg_to_rad } from "~/code/funcs/angle";
import { Text } from "~/code/shapelib/types/text";
import { zerozero } from "~/code/shapelib/types/point";
import { rand_points } from "./graph_visual";

const empty_render: Bundle<Renderable & Interpolate & Transformable> =
    emptyBundle(CircleSolid.empty());

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
                          .distribute_grid(1000)
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
                                        action: show_debug ? "stroke" : "fill",
                                        obj: text,
                                        debug: show_debug,
                                        z_index: 0,
                                    },
                                    {
                                        action: "stroke",
                                        obj: createBundle(bboxes).set_setter(
                                            (ctx) => {
                                                ctx.strokeStyle = "blue";
                                                ctx.lineWidth = 1;
                                                ctx.globalAlpha = bbox_opacity;
                                            }
                                        ),
                                        debug: show_debug,
                                        z_index: 1,
                                    },
                                    {
                                        action: "stroke",
                                        obj: createBundle(
                                            intersecting
                                        ).set_setter((ctx) => {
                                            ctx.strokeStyle = "red";
                                            ctx.lineWidth = 1;
                                            ctx.globalAlpha = bbox_opacity;
                                        }),
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
                                        ).set_setter((ctx) => {
                                            ctx.fillStyle = "red";
                                            ctx.globalAlpha = bbox_opacity;
                                        }),
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
                                        ).set_setter((ctx) => {
                                            ctx.fillStyle = "blue";
                                            ctx.globalAlpha = bbox_opacity;
                                        }),
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
            const t = useAnimationFrame();
            return (
                <div className="h-full">
                    {defaults.title(title)}
                    <div className="relative bottom-12 flex h-full items-center justify-center">
                        <motion.div
                            layoutId="shape_render"
                            className="relative"
                        >
                            <ShapeRender
                                render_id="abstraction"
                                instructions={[
                                    {
                                        action: "fill",
                                        obj: visual
                                            .calc({ t })
                                            .translate(new Point(xgap / 2, 0)),
                                        z_index: 0,
                                    },
                                ]}
                            />
                        </motion.div>
                        <motion.div layoutId="slide_codeblock">
                            <div
                                style={{
                                    transform: `translate(${
                                        -static_props.xgap / 2
                                    }px,${offsety}px)`,
                                    transition: "transform 700ms",
                                }}
                            >
                                <CodeBlock
                                    animateId="codeblock1"
                                    code={code}
                                    language={language}
                                    scale={scale}
                                />
                            </div>
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
                visual: new InterFunc(() => empty_render),
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
                visual: new InterFunc(() => empty_render),
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
                visual: new InterFunc(() => empty_render),
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
                visual: product_visual(),
                xgap: 500,
            },
            {
                code: dedent`
                print(get_price([1, 2, 3, 4, 5]))
                `,
                language: "python",
                scale: 2.7,
                offsety: 0,
                title: "Abstraktion - Funktionen",
                visual: new InterFunc(() => empty_render),
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
                visual: new InterFunc(() => empty_render),
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
                visual: new InterFunc(() => empty_render),
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
                visual: new InterFunc(() => empty_render),
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
                visual: new InterFunc(() => empty_render),
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
                visual: intersect_visual(
                    new Point(-100, 0),
                    false,
                    false,
                    "func"
                ),
                xgap: 800,
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
                visual: intersect_visual(
                    new Point(-100, 0),
                    true,
                    false,
                    "func"
                ),
                xgap: 800,
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
                scale: 1.7,
                offsety: 0,
                title: "Abstraktion - Types",
                visual: intersect_visual(
                    new Point(0, -160),
                    true,
                    true,
                    "func"
                ),
                xgap: 500,
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

                    contains_point(point: Point): boolean {
                        const dx = this.x - point.x;
                        const dy = this.y - point.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        return distance < this.radius;
                    }
                }
                `,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Klassen",
                visual: intersect_visual(
                    new Point(-70, -50),
                    true,
                    true,
                    "class"
                ),
                xgap: 700,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Interfaces",
                visual: multi_shape_visual(false, false, "none"),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Interfaces",
                visual: multi_shape_visual(true, false, "none"),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Interfaces",
                visual: multi_shape_visual(true, true, "none"),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Polymorphism",
                visual: basic_polymorphism(2),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Polymorphism",
                visual: basic_polymorphism(3),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Interfaces",
                visual: multi_shape_visual(true, true, "local"),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Inheritance",
                visual: multi_shape_visual(true, true, "inherit"),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Inheritance",
                visual: multi_shape_visual(true, true, "abstract_inherit"),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Inheritance",
                visual: extend_compare_visual(),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Mutability",
                visual: transforms_visual(
                    () => 0,
                    () => 1,
                    false,
                    {}
                ),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Mutability",
                visual: transforms_visual(
                    (t) => t / 1000,
                    () => 1,
                    false,
                    {}
                ),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Abstraktion - Mutability",
                visual: transforms_visual(
                    () => 0,
                    (t) => interpolate_between(t / 1000, 0.6, 1.2),
                    false,
                    {}
                ),
                xgap: 0,
            },
            {
                code: shape_interface({
                    color: false,
                    is_inside: true,
                    variant: "interface",
                    rotate: "mutable",
                }),
                language: "ts",
                offsety: 0,
                scale: 3,
                title: "Abstraktion - Mutability",
                visual: transforms_visual(
                    () => 0,
                    () => 1,
                    true,
                    {}
                ),
                xgap: 0,
            },
            {
                code: merge_code([
                    shape_interface({
                        color: false,
                        is_inside: true,
                        variant: "interface",
                        rotate: "mutable",
                    }),
                    dedent`
                    class Triangle implements Shape {
                        // ...
                    }
                    `,
                ]),
                language: "ts",
                offsety: 0,
                scale: 3,
                title: "Abstraktion - Mutability",
                visual: transforms_visual(
                    () => 0,
                    () => 1,
                    true,
                    { only_triangle: true }
                ),
                xgap: 0,
            },
            {
                code: merge_code([
                    shape_interface({
                        color: false,
                        is_inside: true,
                        variant: "interface",
                        rotate: "mutable",
                    }),
                    dedent`
                    class Triangle implements Shape {
                        // ...
                    }

                    const triangle = new Triangle();
                    triangle1.rotate(90);

                    console.log(triangle); // Triangle { angle: 90 }
                    `,
                ]),
                language: "ts",
                offsety: 0,
                scale: 2,
                title: "Abstraktion - Mutability",
                visual: transforms_visual(
                    () => deg_to_rad(90),
                    () => 1,
                    true,
                    { only_triangle: true }
                ),
                xgap: 0,
            },
            {
                code: merge_code([
                    shape_interface({
                        color: false,
                        is_inside: true,
                        variant: "interface",
                        rotate: "mutable",
                    }),
                    dedent`
                    class Triangle implements Shape {
                        // ...
                    }

                    const triangle1 = new Triangle();
                    const triangle2 = triangle1; 

                    triangle2.rotate(90);

                    console.log(triangle1); // Triangle { angle: 90 }
                    console.log(triangle2); // Triangle { angle: 90 }

                    triangle1.rotate(90);

                    console.log(triangle1); // Triangle { angle: 180 }
                    console.log(triangle2); // Triangle { angle: 180 }
                    `,
                ]),
                language: "ts",
                offsety: -60,
                scale: 1.6,
                title: "Abstraktion - Mutability",
                visual: transforms_visual(
                    () => deg_to_rad(180),
                    () => 1,
                    true,
                    { only_triangle: true }
                ),
                xgap: 0,
            },
            {
                code: ``,
                language: "ts",
                offsety: -60,
                scale: 1.6,
                title: "Abstraktion - Mutability",
                visual: new InterFunc(({ t }) =>
                    createBundle([
                        transforms_visual(
                            () => deg_to_rad(180),
                            () => 1,
                            true,
                            { only_triangle: true }
                        ).calc({ t }),
                        new Text("Shared Mutable State", zerozero, 90)
                            .recenter("both")
                            .translate(new Point(80, 0)),
                    ])
                ),
                xgap: 0,
            },
            {
                code: shape_interface({
                    color: false,
                    is_inside: true,
                    variant: "interface",
                    rotate: "mutable",
                }),
                language: "ts",
                offsety: 0,
                scale: 3,
                title: "Abstraktion - Mutability",
                visual: transforms_visual(
                    () => 0,
                    () => 1,
                    true,
                    { only_triangle: true }
                ),
                xgap: 0,
            },
            {
                code: shape_interface({
                    color: false,
                    is_inside: true,
                    variant: "interface",
                    rotate: "immutable",
                }),
                language: "ts",
                offsety: 0,
                scale: 3,
                title: "Abstraktion - Immutability",
                visual: transforms_visual(
                    () => 0,
                    () => 1,
                    true,
                    { only_triangle: true }
                ),
                xgap: 0,
            },
            {
                code: merge_code([
                    shape_interface({
                        color: false,
                        is_inside: true,
                        variant: "interface",
                        rotate: "immutable",
                    }),
                    dedent`
                    class Triangle implements Shape {
                        // ...
                    }

                    const triangle = new Triangle();
                    const rotated_triangle = triangle.rotate(90);

                    console.log(triangle); // Triangle { angle: 0 }
                    console.log(rotated_triangle); // Triangle { angle: 90 }
                    `,
                ]),
                language: "ts",
                offsety: 0,
                scale: 2,
                title: "Abstraktion - Immutability",
                visual: transforms_visual(
                    () => 0,
                    () => 1,
                    true,
                    { only_triangle: true }
                ),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 2,
                title: "Abstraktion - Immutability",
                visual: transforms_visual(
                    () => 0,
                    () => 1,
                    true,
                    { only_triangle: true }
                ),
                xgap: 0,
            },
            {
                code: dedent`
                const shapes = [
                    new Triangle(),
                    new Square(),
                    new Hexagon(),
                    new Circle(),
                    new Text("Test"),
                ];
                `,
                language: "ts",
                offsety: 0,
                scale: 3,
                title: "Abstraktion - Generics",
                visual: transforms_visual(
                    () => 0,
                    () => 1,
                    true,
                    {}
                ),
                xgap: 0,
            },
            {
                code: dedent`
                const shapes = [
                    new Triangle(),
                    new Square(),
                    new Hexagon(),
                    new Circle(),
                    new Text("Test"),
                ];

                for (const shape of shapes) {
                    shape.rotate(90);
                }
                `,
                language: "ts",
                offsety: 0,
                scale: 3,
                title: "Abstraktion - Generics",
                visual: transforms_visual(
                    () => deg_to_rad(90),
                    () => 1,
                    true,
                    {}
                ),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 3,
                title: "Abstraktion - Generics",
                visual: new InterFunc(({ t }) =>
                    createBundle(
                        rand_points(t).map((p) => p.to_circle_solid(20))
                    )
                ),
                xgap: 0,
            },
            {
                code: dedent`
                const shapes = [
                    new Triangle(),
                    new Square(),
                    new Hexagon(),
                    new Circle(),
                    new Text("Test"),
                ];

                function rotate_shapes<T extends Shape>(shapes: T[], angle: number) {
                    for (const shape of shapes) {
                        shape.rotate(angle);
                    }
                }
                `,
                language: "ts",
                offsety: -40,
                scale: 1.7,
                title: "Abstraktion - Generics",
                visual: transforms_visual(
                    () => deg_to_rad(90),
                    () => 1,
                    true,
                    {}
                ),
                xgap: 0,
            },
            {
                code: dedent`
                const shapes = [
                    new Triangle(),
                    new Square(),
                    new Hexagon(),
                    new Circle(),
                    new Text("Test"),
                ];

                function rotate_shapes<T extends Shape>(shapes: T[], angle: number) {
                    for (const shape of shapes) {
                        shape.rotate(angle);
                    }
                }
                `,
                language: "ts",
                offsety: -40,
                scale: 1.7,
                title: "Abstraktion - Generics",
                visual: transforms_visual(
                    () => deg_to_rad(90),
                    () => 1,
                    true,
                    {}
                ),
                xgap: 0,
            },
            {
                code: dedent``,
                language: "ts",
                offsety: 0,
                scale: 1.6,
                title: "Ende",
                visual: end_visual,
                xgap: 0,
            },
        ] as {
            code: string;
            language: keyof typeof languages;
            scale: number;
            offsety: number;
            title: string;
            visual: InterFunc<
                Bundle<Interpolate & Renderable & Transformable>,
                { t: number }
            >;
            xgap: number;
        }[],
        switch_duration: 1000,
        disable: ["scale"],
    }),
];
