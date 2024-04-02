import { Layout } from "../_components/Layout";

const Page = () => {
    return (
        <Layout>
            <div className="flex justify-center items-center flex-grow">
                <div className="w-[550px] h-[350px] max-w-full text-white bg-slate-900 backdrop-blur-sm bg-opacity-60 p-4 rounded-md border-[1px] border-white border-opacity-30 flex flex-col gap-4">
                    <h1 className="text-4xl font-bold">Kontakt</h1>
                    <div className="flex gap-2">
                        Email:
                        <div>
                            <a
                                href="mailto:jeremy@moeglich.dev"
                                className="underline text-blue-600"
                            >
                                jeremy@moeglich.dev
                            </a>
                            <br />
                            <a
                                href="mailto:jeremy.moeglich@gmail.com"
                                className="underline text-blue-600"
                            >
                                jeremy.moeglich@gmail.com
                            </a>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        Telefon:
                        <a
                            href="tel:+491757494569"
                            className="underline text-blue-600"
                        >
                            +49 175 7494569
                        </a>
                    </div>
                    <div className="flex gap-2">
                        Github:
                        <a
                            href="https://github.com/JeremyMoeglich"
                            className="underline text-blue-600"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            https://github.com/JeremyMoeglich
                        </a>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Page;
