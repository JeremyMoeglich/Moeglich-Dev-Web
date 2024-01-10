"use client";

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
    ([uTime], position, { gl_FragColor }) => {
        gl_FragColor.set(uTime.sin().concat([0,0,0]));
    },
);

export default function Page() {
    const [current, setCurrent] = useState<number[]>([]);
    const time = useAnimationTime();

    useEffect(() => {
        setCurrent(
            func(
                {
                    uTime: time,
                },
                [10, 1],
            ),
        );
    }, [time]);

    return (
        <div>
            {time}
            {current.map((x, i) => (
                <div key={i}>{x}</div>
            ))}
        </div>
    );
}
