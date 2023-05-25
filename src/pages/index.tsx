import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
    return (
        <>
            <Head>
                <title>Moeglich.Dev</title>
                <meta
                    name="description"
                    content="moeglichdev - website from jeremy moeglich"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] p-4">
                <h1 className="text-4xl text-white">moeglich.dev</h1>
                <div className="flex flex-grow items-center justify-center text-6xl text-white">
                    <Link href="/present">Presentation</Link>
                </div>
            </main>
        </>
    );
};

export default Home;
