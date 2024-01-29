import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { type NextPage } from "next";
import { Layout } from "~/code/components/Layout";
import { projects } from "~/data/tlink";

const Projects: NextPage = () => {
    return (
        <Layout>
            <div className="grid max-w-[2000px] grid-cols-1 gap-4 text-white sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {projects.map((p) => (
                    <div
                        key={p.name}
                        className="flex flex-col gap-2 rounded-lg bg-slate-700 p-2"
                    >
                        {"site_image" in p && (
                            <img
                                src={p.site_image}
                                alt={p.name}
                                className="w-full rounded-md"
                            />
                        )}
                        <div className="flex gap-2">
                            <h3 className="text-lg">{p.name}</h3>
                            {"github_url" in p && (
                                <>
                                    -
                                    <a
                                        href={p.github_url}
                                        className="flex items-center gap-1"
                                    >
                                        Github <GitHubLogoIcon />
                                    </a>
                                </>
                            )}
                            {"site_url" in p && (
                                <>
                                    -
                                    <a
                                        href={p.site_url}
                                        className="flex items-center gap-1"
                                        target="_blank"
                                    >
                                        Site
                                        {"icon" in p && (
                                            <img
                                                src={p.icon}
                                                alt={p.name}
                                                className="w-4"
                                            />
                                        )}
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default Projects;
