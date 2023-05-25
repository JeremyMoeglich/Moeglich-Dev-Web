import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { CrossTextProvider } from "~/utils/cross_text";

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    return (
        <SessionProvider session={session}>
            <CrossTextProvider>
                <Component {...pageProps} />
            </CrossTextProvider>
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
