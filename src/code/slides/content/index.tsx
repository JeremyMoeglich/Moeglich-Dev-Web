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
            offset,
            bbox_opacity,
            show_debug,
            aspect_index,
            code_opacity,
        }) => {
            const time = useAnimationFrame();
            const text = useTextShape("Das ist ein Text.")
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
            const dot_rect_offset = new Point(
                interpolate_between(time / 3000, -200, 1200),
                0
            );
            const dot_rect = new RectSolid(-300, -300, 600, 600).translate(
                dot_rect_offset
            );
            const samples = dot_rect.distribute_grid(2000).map((point) => {
                return [point, text.contains(point, 0)] as const;
            });
            const bboxes = full_beziers.map((bezier) => bezier.bbox());
            return (
                <div className="h-full">
                    {defaults.title("Abstraktion")}
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
                            <div style={{ opacity: code_opacity }}>
                                <CodeBlock
                                    code={dedent`
                                print("Das ist ein Text.")
                                `}
                                    language="python"
                                    animateId="codeblock1"
                                    scale={2}
                                />
                            </div>
                        </div>
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
                code_opacity: 0,
            },
            {
                text_scale: 5,
                offset: new Point(0, 0),
                bbox_opacity: 1,
                show_debug: true,
                aspect_index: 1,
                code_opacity: 0,
            },
            {
                text_scale: 1,
                offset: new Point(0, 0),
                bbox_opacity: 0,
                show_debug: false,
                aspect_index: 2,
                code_opacity: 1,
            },
        ],
        switch_duration: 1000,
    }),
    InterpolatorStage({
        Component: ({ code }) => {
            return (
                <div>
                    <CodeBlock
                        code={code}
                        language="js"
                        animateId="codeblock1"
                        scale={2}
                    />
                </div>
            );
        },
        switch_duration: 1000,
        props_list: [
            {
                code: dedent`
                function processEmployees(employees) {
                    let activeEmployees = [];
                    for (let i = 0; i < employees.length; i++) {
                        if (employees[i].isActive) {
                            activeEmployees.push(employees[i]);
                        }
                    }
    
                    let totalAge = 0;
                    let count = 0;
                    for (let i = 0; i < activeEmployees.length; i++) {
                        totalAge += activeEmployees[i].age;
                        count++;
                    }
                    let averageAge = totalAge / count;
    
                    let sortedEmployees = [];
                    for (let i = 0; i < activeEmployees.length; i++) {
                        let insertIndex = sortedEmployees.length;
                        for (let j = 0; j < sortedEmployees.length; j++) {
                            if (activeEmployees[i].lastName < sortedEmployees[j].lastName) {
                                insertIndex = j;
                                break;
                            }
                        }
                        sortedEmployees.splice(insertIndex, 0, activeEmployees[i]);
                    }
    
                    return { sortedEmployees, averageAge };
                }
                `,
            },
            {
                code: dedent`
                function processEmployees(employees) {
                    let activeEmployees = employees.filter(employee => employee.isActive);
                  
                    let totalAge = 0;
                    let count = 0;
                    for (let i = 0; i < activeEmployees.length; i++) {
                        totalAge += activeEmployees[i].age;
                        count++;
                    }
                    let averageAge = totalAge / count;
                  
                    let sortedEmployees = [];
                    for (let i = 0; i < activeEmployees.length; i++) {
                        let insertIndex = sortedEmployees.length;
                        for (let j = 0; j < sortedEmployees.length; j++) {
                            if (activeEmployees[i].lastName < sortedEmployees[j].lastName) {
                                insertIndex = j;
                                break;
                            }
                        }
                        sortedEmployees.splice(insertIndex, 0, activeEmployees[i]);
                    }
                  
                    return { sortedEmployees, averageAge };
                }
                `,
            },
            {
                code: dedent`
                function processEmployees(employees) {
                    let activeEmployees = employees.filter(employee => employee.isActive);
                  
                    let totalAge = activeEmployees.reduce((total, employee) => total + employee.age, 0);
                    let averageAge = totalAge / activeEmployees.length;
                  
                    let sortedEmployees = [];
                    for (let i = 0; i < activeEmployees.length; i++) {
                        let insertIndex = sortedEmployees.length;
                        for (let j = 0; j < sortedEmployees.length; j++) {
                            if (activeEmployees[i].lastName < sortedEmployees[j].lastName) {
                                insertIndex = j;
                                break;
                            }
                        }
                        sortedEmployees.splice(insertIndex, 0, activeEmployees[i]);
                    }
                  
                    return { sortedEmployees, averageAge };
                }
                `,
            },
            {
                code: dedent`
                function processEmployees(employees) {
                    let activeEmployees = employees.filter(employee => employee.isActive);
    
                    let totalAge = activeEmployees.reduce((total, employee) => total + employee.age, 0);
                    let averageAge = totalAge / activeEmployees.length;
    
                    let sortedEmployees = [...activeEmployees].sort((a, b) => a.lastName.localeCompare(b.lastName));
    
                    return { sortedEmployees, averageAge };
                }
                `,
            },
        ],
    }),
];
