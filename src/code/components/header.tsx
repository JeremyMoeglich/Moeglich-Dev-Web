"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import { usePathname } from "next/navigation";
import Link from "next/link";

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

export function Header(props: { slim: boolean }) {
    const path = usePathname();
    const path_map = {
        "/": "Home",
        "/projects": "Projects",
        // "/about": "About",
        // "/contact": "Contact",
    };

    const current = path_map[path as keyof typeof path_map];

    return (
        <div className="relative mb-40">
            <div className="flex justify-end">
                {Object.entries(path_map).map(([path, name]) => (
                    <NavigationEntry
                        key={path}
                        name={name}
                        current={current === name}
                        path={path}
                    ></NavigationEntry>
                ))}
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
