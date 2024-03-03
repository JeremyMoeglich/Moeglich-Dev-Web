import type { PropsWithChildren } from "react";
import { Header } from "./header";

export function Layout({
    children,
    slim,
}: PropsWithChildren<{ slim?: boolean }>) {
    slim = !!slim;
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#161229] to-[#04074b]">
            <Header slim={slim} />
            <div className="z-10">{children}</div>
        </div>
    );
}
