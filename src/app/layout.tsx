import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import Head from "next/head";

import { CrossTextProvider } from "~/utils/cross_text";
import { ShapeRenderProvider } from "~/code/shapelib/funcs/shape_render";
import { TRPCReactProvider } from "~/trpc/react";
import type { NonEmptyArray } from "functional-utilities";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata = {
    title: "Moeglich.Dev",
    description: "Moeglichdev - Website / Portfolio of Jeremy Moeglich",
    icons: [{ rel: "icon", url: "/favicon.ico" }] satisfies NonEmptyArray<{
        rel: string;
        url: string;
    }>,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <Head>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description} />
                <link rel="icon" href={metadata.icons[0].url} />
            </Head>
            <body className={`font-sans ${inter.variable}`}>
                <CrossTextProvider>
                    <ShapeRenderProvider>
                        <TRPCReactProvider cookies={cookies().toString()}>
                            <main className="h-screen w-full">{children}</main>
                        </TRPCReactProvider>
                    </ShapeRenderProvider>
                </CrossTextProvider>
            </body>
        </html>
    );
}
