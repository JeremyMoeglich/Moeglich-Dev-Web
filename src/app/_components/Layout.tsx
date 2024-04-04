import type { PropsWithChildren } from "react";
import { Header } from "./header";
import { Footer } from "./footer";

export function Layout({
    children,
    slim,
}: PropsWithChildren<{ slim?: boolean }>) {
    slim = !!slim;
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#161229] to-[#04074b]">
            <Header slim={slim} />
            <div className="z-10 flex-grow flex flex-col">{children}</div>
            <Footer />
        </div>
    );
}
