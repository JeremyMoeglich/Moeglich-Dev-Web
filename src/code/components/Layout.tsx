import { PropsWithChildren } from "react";
import { Header } from "./header";

export function Layout({ children }: PropsWithChildren<Record<string, never>>) {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#161229] to-[#04074b]">
            <Header></Header>
            {children}
        </div>
    );
}
