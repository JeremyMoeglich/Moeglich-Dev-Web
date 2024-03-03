import type { NextPage } from "next";
import { Layout } from "~/app/_components/Layout";
import { TopAnimation } from "~/app/_components/top_animation";
import { Technologies } from "./_components/technologies";

const Home: NextPage = () => {
    return (
        <Layout>
            <TopAnimation />
            <Technologies />
        </Layout>
    );
};

export default Home;
