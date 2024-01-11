import { type NextPage } from "next";
import { Layout } from "~/code/components/Layout";
import { TopAnimation } from "~/code/components/top_animation";
import * as Icons from "./_components/icons";

const Home: NextPage = () => {
    return (
        <Layout>
            <TopAnimation></TopAnimation>
            <div className="mt-48 w-full bg-gradient-to-b from-[#120f22] to-[#04074b]">
                <div>Technologies</div>
                <div className="flex">
                    <Icons.NextJsIcon />
                    <Icons.TailwindIcon />
                    <Icons.TypescriptIcon />
                    <Icons.ReactIcon />
                    <Icons.QwikIcon />
                </div>
            </div>
        </Layout>
    );
};

export default Home;
