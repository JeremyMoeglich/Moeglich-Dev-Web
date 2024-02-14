"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { maybe_global } from "functional-utilities";
import { maybe_window } from "~/utils/maybe_window";

function NavigationEntry(props: {
    name: string;
    current: boolean;
    path: string;
}) {
    return (
        <Link
            href={props.path}
            className="relative flex items-center justify-center p-3"
            style={{
                color: props.current ? "white" : "gray",
                fontWeight: props.current ? "bold" : "normal",
                textDecoration: props.current ? "underline" : "none",
            }}
        >
            <div className="z-50 text-3xl">{props.name}</div>
        </Link>
    );
}

function useYScroll() {
    const [y, setY] = useState(0);
    useEffect(() => {
        const body = maybe_global("document")?.body;
        if (!body) return;
        const handler = () => setY(body.scrollTop);
        body.addEventListener("scroll", handler);
        return () => body.removeEventListener("scroll", handler);
    }, []);
    return y;
}

export function Header(props: { slim: boolean }) {
    const path = usePathname();
    const path_map = {
        "/": "Home",
        "/overview": "Projects",
        // "/about": "About",
        // "/contact": "Contact",
    };

    const current = path_map[path as keyof typeof path_map];

    return (
        <div className="relative mb-20">
            <div className="flex">
                <Link className="z-50 p-3 text-3xl text-white" href="/">
                    moeglich.dev
                </Link>
                <div className="ml-auto flex">
                    {Object.entries(path_map).map(([path, name]) => (
                        <NavigationEntry
                            key={path}
                            name={name}
                            current={current === name}
                            path={path}
                        ></NavigationEntry>
                    ))}
                </div>
            </div>
            {!props.slim ? (
                <>
                    <div className="pointer-events-none absolute left-0 top-0">
                        <img
                            src="/images/home/top_left_grad.svg"
                            alt=""
                            className="origin-top-left scale-[1.68]"
                        />
                    </div>
                    <div className="pointer-events-none absolute right-0 top-0">
                        <img
                            src="/images/home/top_right_grad.svg"
                            alt=""
                            className="origin-top-right scale-[1.68]"
                        />
                    </div>
                </>
            ) : null}
        </div>
    );
}
