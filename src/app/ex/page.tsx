"use client";

import { type NextPage } from "next";
import { useState } from "react";
import { CrossText } from "~/utils/cross_text";

const Example: NextPage = () => {
    const [toggle, setToggle] = useState(false);

    return (
        <div>
            <button onClick={() => setToggle(!toggle)}>Toggle</button>
            <div className="flex w-screen justify-evenly">
                <div className="w-32">
                    <h2>Box 1</h2>
                    {toggle && (
                        <CrossText animateId="title" tokens={["Hello World"]} />
                    )}
                </div>
                <div className="w-32">
                    <h2>Box 2</h2>
                    {!toggle && (
                        <CrossText animateId="title" tokens={["Hello World"]} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Example;
