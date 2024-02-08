import { type NextPage } from "next";
import { Layout } from "~/code/components/Layout";
import { TopAnimation } from "~/code/components/top_animation";
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
