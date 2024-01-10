"use client";

import { chunk } from "lodash-es";
import { useEffect, useState } from "react";
import { fragment_only_shader } from "~/code/tgpu/webgl1/compute";
import { useAnimationTime } from "~/utils/use_update";

const func = fragment_only_shader(
    [
        {
            name: "uTime",
            variable_type: {
                type: "float",
                precision: "highp",
            },
        },
    ],
    ([uTime], uPosition, { gl_FragColor }) => {
        gl_FragColor.set(uTime.sin().concat([0, 0, 1]));
    },
);

export default function Page() {
    const [current, setCurrent] = useState<number[]>([]);
    const time = useAnimationTime();

    useEffect(() => {
        setCurrent(
            func(
                {
                    uTime: time / 1000,
                },
                [4, 4],
            ),
        );
    }, [time]);

    return (
        <div>
            {time}
            {chunk(current, 4).map((row, i) => (
                <div key={i}>
                    {row[0]} - {row[1]} - {row[2]} - {row[3]}
                </div>
            ))}
        </div>
    );
}
