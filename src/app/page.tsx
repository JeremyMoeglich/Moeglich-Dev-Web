"use server";

import { type NextPage } from "next";
import { Layout } from "~/code/components/Layout";
import { TopAnimation } from "~/code/components/top_animation";

const Home: NextPage = () => {
    return (
        <Layout>
            <TopAnimation></TopAnimation>
        </Layout>
    );
};

export default Home;
