import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { CrossTextProvider } from "~/utils/cross_text";
import { ShapeRenderProvider } from "~/code/shapelib/funcs/shape_render";
import Head from "next/head";
import "~/code/wdyr";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <CrossTextProvider>
            <SessionProvider session={session}>
                <ShapeRenderProvider>
                    <Head>
                        <title>Moeglich.Dev</title>
                        <meta
                            name="description"
                            content="Moeglichdev - Website / Portfolio of Jeremy Moeglich"
                        />
                        <link rel="icon" href="/favicon.ico" />
                    </Head>
                    <main className="h-screen w-full">
                        <Component {...pageProps} />
                    </main>
                </ShapeRenderProvider>
            </SessionProvider>
        </CrossTextProvider>
    );
};

export default api.withTRPC(MyApp);
