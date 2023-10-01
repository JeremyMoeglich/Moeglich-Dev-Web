import { type NextPage } from "next";
import Head from "next/head";
import { TopAnimation } from "~/code/components/top_animation";

const Home: NextPage = () => {
    return (
        <>
            <Head>
                <title>Moeglich.Dev</title>
                <meta
                    name="description"
                    content="Moeglichdev - Website / Portfolio of Jeremy Moeglich"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#4e3e64] to-[#15162c] p-4">
                <TopAnimation></TopAnimation>
            </main>
        </>
    );
};

export default Home;
