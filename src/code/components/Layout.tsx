import type { PropsWithChildren } from "react";
import { Header } from "./header";

// eslint-disable-next-line @typescript-eslint/ban-types
export function Layout({ children }: PropsWithChildren<{}>) {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#161229] to-[#04074b]">
            <Header></Header>
            {children}
        </div>
    );
}
