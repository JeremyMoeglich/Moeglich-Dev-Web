import { makeNoise3D } from "fast-simplex-noise";
import { type NextPage } from "next";
import Head from "next/head";
import { useMemo } from "react";
import { createBundle } from "~/code/bundle";
import { Point } from "~/code/shapelib";
import { ShapeRender } from "~/code/shapelib/funcs/shape_render";
import { textToShapes } from "~/code/shapelib/funcs/text_to_shape";
import { interpolate } from "~/utils/interpolate";
import { useAsyncValue } from "~/utils/use_async_value";
import { useConstant } from "~/utils/use_persist";
import { useAnimationFrame } from "~/utils/use_update";

const Home: NextPage = () => {
    const shape = useAsyncValue(
        async () => {
            return await textToShapes("moeglich.dev");
        },
        undefined,
        "moeglich.dev"
    );
    const time = useAnimationFrame();
    const start_time = useMemo(() => time, [shape]);
    const noise1 = useConstant(makeNoise3D());
    const noise2 = useConstant(makeNoise3D());
    const t = (time - start_time) / 1000;
    const k = interpolate(
        [
            {
                duration: 1,
                value: {
                    x: 0,
                    y: 0,
                },
            },
            {
                duration: 1,
                value: {
                    x: 0,
                    y: 100,
                },
            },
            // Optionally, add a third point to actually see Bezier-like interpolation in action
            {
                duration: 1,
                value: {
                    x: 100,
                    y: 100,
                },
            },
        ],
        t,
    );    
    return (
        <>
            <Head>
                <title>Moeglich.Dev</title>
                <meta
                    name="description"
                    content="Moeglichdev - Website / Portfolio of Jeremy Moeglich"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#4e3e64] to-[#15162c] p-4">
                <ShapeRender
                    render_id="MoeglichDev"
                    instructions={
                        !shape
                            ? []
                            : [
                                  {
                                      obj: createBundle(
                                          shape
                                              .scale(0.13)
                                              .translate(
                                                  new Point(-6300 + k.x, 500 + k.y)
                                              )
                                              .triangulate(Math.min(3, t))
                                      )
                                          .map_points((p) =>
                                              p.translate(
                                                  new Point(
                                                      noise1(
                                                          p.x / 100,
                                                          p.y / 100,
                                                          t / 2
                                                      ) * 5,
                                                      noise2(
                                                          p.x / 100,
                                                          p.y / 100,
                                                          t / 2
                                                      ) * 5
                                                  )
                                              )
                                          )
                                          .set_setter((ctx) => {
                                              ctx.strokeStyle = "#fff";
                                          }),
                                      action: "stroke",
                                      z_index: 0,
                                  },
                              ]
                    }
                />
            </main>
        </>
    );
};

export default Home;
