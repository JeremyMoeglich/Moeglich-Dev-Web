import type { PropsWithChildren } from "react";
import { Header } from "./header";

// eslint-disable-next-line @typescript-eslint/ban-types
export function Layout({
    children,
    slim,
}: PropsWithChildren<{ slim?: boolean }>) {
    slim = !!slim;
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#161229] to-[#04074b]">
            <Header slim={slim}></Header>
            {children}
        </div>
    );
}
