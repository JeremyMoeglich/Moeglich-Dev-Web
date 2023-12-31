import type { PropsWithChildren } from "react";
import { Header } from "./header";

// eslint-disable-next-line @typescript-eslint/ban-types
export function Layout({ children }: PropsWithChildren<{}>) {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#161229] to-[#04074b]">
            <Header></Header>
            {children}
        </div>
    );
}
