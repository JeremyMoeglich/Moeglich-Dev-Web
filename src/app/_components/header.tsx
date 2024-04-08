"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { maybe_global } from "functional-utilities";
import { CgHome, CgList, CgMail } from "react-icons/cg";
function NavigationEntry(props: {
    name: () => ReactNode;
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
            <div className="z-50 text-2xl sm:text-3xl">{props.name()}</div>
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

export function Header() {
    const path = usePathname();
    const path_map = {
        "/": () => (
            <span className="flex items-center gap-2">
                <CgHome /> Home
            </span>
        ),
        "/overview": () => (
            <span className="flex items-center gap-2">
                <CgList /> Projekte
            </span>
        ),
        // "/about": "About",
        "/contact": () => (
            <span className="flex items-center gap-2">
                <CgMail /> Kontakt
            </span>
        )
    };

    const current = path_map[path as keyof typeof path_map];

    return (
        <div className="relative">
            <div className="flex flex-wrap justify-between">
                <Link className="z-50 p-3 text-3xl text-white hidden md:flex" href="/">
                    moeglich.dev
                </Link>
                <div className="flex justify-evenly w-full md:w-auto md:justify-start">
                    {Object.entries(path_map).map(([path, name]) => (
                        <NavigationEntry
                            key={path}
                            name={name}
                            current={current === name}
                            path={path}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
