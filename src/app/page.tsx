import { type NextPage } from "next";
import { Layout } from "~/code/components/Layout";
import { TopAnimation } from "~/code/components/top_animation";

const Home: NextPage = () => {
    return (
        <Layout>
            <TopAnimation></TopAnimation>
            <div className="mt-48 w-full bg-gradient-to-b from-[#120f22] to-[#04074b]">
                Test
            </div>
        </Layout>
    );
};

export default Home;
