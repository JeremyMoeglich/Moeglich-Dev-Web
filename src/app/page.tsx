import type { NextPage } from "next";
import { Layout } from "~/app/_components/Layout";
import { TopAnimation } from "~/app/_components/top_animation";
import { Technologies } from "./_components/technologies";

const Home: NextPage = () => {
    return (
        <Layout>
            <div className="mt-32">
                <div className="mb-32">
                    <TopAnimation />
                </div>
                <Technologies />
            </div>
        </Layout>
    );
};

export default Home;
