import type { NextPage } from "next";
import { Layout } from "~/app/_components/Layout";
import { TopAnimation } from "~/app/_components/top_animation";
import { Technologies } from "./_components/technologies";

const Home: NextPage = () => {
    return (
        <Layout>
            <div className="mb-[200px]" style={{
                marginTop: "7vw"
            }}>
                <div className="mb-8 px-3 pb-[8vw]">
                    <TopAnimation />
                </div>
                <Technologies />
            </div>
        </Layout>
    );
};

export default Home;
