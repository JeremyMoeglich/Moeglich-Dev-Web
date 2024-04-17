import "~/styles/globals.css";

import { Gabarito } from "next/font/google";
import { cookies } from "next/headers";
import type { Metadata } from "next";

import { CrossTextProvider } from "~/utils/cross_text";
import { ShapeRenderProvider } from "~/code/shapelib/funcs/shape_render";
import { TRPCReactProvider } from "~/trpc/react";
import type { NonEmptyArray } from "functional-utilities";
import { CookiesProvider } from "next-client-cookies/server";

const inter = Gabarito({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

export const metadata = {
    title: "Moeglich.Dev",
    description: "Moeglichdev - Website / Portfolio of Jeremy Moeglich",
    icons: [{ rel: "icon", url: "/favicon.svg" }] satisfies NonEmptyArray<{
        rel: string;
        url: string;
    }>,
} satisfies Metadata;

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`font-sans ${inter.variable} overflow-x-hidden`}>
                <CookiesProvider>
                    <CrossTextProvider>
                        <TRPCReactProvider cookies={cookies().toString()}>
                            <main className="w-full">{children}</main>
                        </TRPCReactProvider>{" "}
                    </CrossTextProvider>
                </CookiesProvider>
            </body>
        </html>
    );
}
