import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { CrossTextProvider } from "~/utils/cross_text";
import { ShapeRenderProvider } from "~/code/shapelib/funcs/shape_render";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <CrossTextProvider>
            <SessionProvider session={session}>
                <ShapeRenderProvider>
                    <Component {...pageProps} />
                </ShapeRenderProvider>
            </SessionProvider>
        </CrossTextProvider>
    );
};

export default api.withTRPC(MyApp);
