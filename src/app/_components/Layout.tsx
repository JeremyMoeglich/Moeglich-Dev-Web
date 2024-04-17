import type { PropsWithChildren } from "react";
import { Header } from "./header";
import { Footer } from "./footer";

export function Layout({ children }: PropsWithChildren<{}>) {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-r from-[#0d0c2e] to-[#01066e]">
            <div className="pointer-events-none absolute left-0 top-0 overflow-x-hidden overflow-y-visible">
                <img src="/images/home/top_left_grad.svg" alt="" />
            </div>
            <div className="pointer-events-none absolute right-0 top-0 overflow-x-hidden overflow-y-visible">
                <img src="/images/home/top_right_grad.svg" alt="" />
            </div>

            <Header />
            <div className="flex-grow flex flex-col z-10">{children}</div>
            <Footer />
        </div>
    );
}
