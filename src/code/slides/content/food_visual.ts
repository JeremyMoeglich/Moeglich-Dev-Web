import { makeNoise3D } from "fast-simplex-noise";
import { createBundle } from "~/code/bundle";
import { CircleSolid, HollowShape, LineSegment, Point, PolygonSolid, RectSolid, TriangleSolid } from "~/code/shapelib";
import { InterFunc } from "~/code/shapelib/types/InterFunc";
import { zerozero } from "~/code/shapelib/types/point";
import gen from 'random-seed';

const rand = gen.create("Seed51");
const random = () => rand.random();

const noise1 = makeNoise3D(random);
const noise2 = makeNoise3D(random);
const noise3 = makeNoise3D(random);
const noise4 = makeNoise3D(random);

const triangle = new TriangleSolid(new Point(0, 50), new Point(100, 0), new Point(100, 100)).set_setter((ctx) => {
    ctx.fillStyle = 'yellow'
});
const triangle_bezier = new PolygonSolid(triangle.vertices()).to_bezier()
export const pizza = createBundle([
    triangle,
    new LineSegment(new Point(100, 0), new Point(100, 100)).to_polygon(10).set_setter((ctx) => {
        ctx.fillStyle = "brown"
    }),
    createBundle(triangle.bbox().distribute_grid(14).map(p => p.to_circle_solid(Math.abs(noise3(p.x, p.y, 1) * 3) + 8).translate(
        new Point(
            noise1(p.x * 200, p.y, 1) * 50,
            noise2(p.x * 200, p.y, 1) * 50
        )
    )).filter(c => triangle_bezier.relation_to(c.to_bezier()) === 'other_inside_this')).set_setter((ctx) => {
        ctx.fillStyle = "#dd0000"
    })
]).scale(2)

const rect = new RectSolid(-150, -100, 300, 200);
const circle = new CircleSolid(new Point(0, 0), 100);
const circle_bezier = circle.to_bezier()
const chip_size = 10;

export const cookie = createBundle([
    circle.set_setter((ctx) => {
        ctx.fillStyle = "brown";
    }),
    createBundle(
        circle
            .bbox()
            .distribute_grid(200)
            .filter((p) => circle.contains(p))
            .map(
                (p) =>
                    new RectSolid(
                        p.x - chip_size / 2,
                        p.y - chip_size / 2,
                        chip_size * 0.7,
                        chip_size * 1.3
                    ).to_polygon().rotate(noise3(p.x, p.y, 1) * 100).scale(noise4(p.x, p.y, 1) * 2).translate(new Point(
                        noise1(p.x * 10, p.y * 10, 1) * 10,
                        noise1(p.x * 10, p.y * 10, 1) * 10
                    ))

            )
            .filter(b => circle_bezier.relation_to(b.to_bezier()) === 'other_inside_this')
    ).set_setter((ctx) => { ctx.fillStyle = "black" }),
]);


export const cheese = new HollowShape(rect.to_polygon().to_bezier(), [
    ...rect
        .distribute_grid(8)
        .map((p) =>
            p
                .translate(
                    new Point(
                        noise1(p.x, p.y, 3) * 40,
                        noise2(p.x, p.y, 3) * 40
                    )
                )
                .to_circle_solid(20)
                .to_bezier()
        )
        .filter(c => rect.relation_to(c.bbox()) === 'other_inside_this'),
])
    .set_setter((ctx) => {
        ctx.fillStyle = "yellow";
    })


export const food_visual = new InterFunc(({ t }: { t: number }) => {
    return createBundle([
        cheese
            .rotate(t / 1000)
            .translate(new Point(200, 0)),
        cookie
            .rotate(t / 1000)
            .translate(new Point(-200, 0)),
        pizza
            .rotate(t / 1000)
            .translate(new Point(0, 200))
    ]).rotate(t / 2000, zerozero).scale(1, zerozero).translate(new Point(500, 0));
});
