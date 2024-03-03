"use client";

import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { type NextPage } from "next";
import { Layout } from "~/app/_components/Layout";
import { TLinkComponent, projects } from "~/data/tlink";
import { AnimatePresence, motion } from "framer-motion";

const Projects: NextPage = () => {
    return (
        <Layout>
            <div className="grid max-w-[2000px] grid-cols-1 gap-4 px-4 text-white sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {projects.map((p) => (
                    <div
                        key={p.name}
                        className="flex flex-col gap-2 rounded-lg bg-gradient-to-t from-[#2c2454bc] to-[#000334be] p-2 shadow-lg backdrop-blur-md"
                    >
                        {"image" in p && (
                            <TLinkComponent name={p.name}>
                                <motion.img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-full rounded-md border-[2px] border-transparent shadow-md duration-300 hover:border-gray-500"
                                    layoutId={p.name}
                                />
                            </TLinkComponent>
                        )}
                        {"summary" in p && (
                            <p className="text-sm">{p.summary}</p>
                        )}
                        <span className="flex gap-2">
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
                                        rel="noreferrer"
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
                            {"package_url" in p && (
                                <>
                                    -
                                    <a
                                        href={p.package_url}
                                        className="flex items-center gap-1"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {p.package_url.includes("npmjs.com")
                                            ? "NPM"
                                            : p.package_url.includes("pypi.org")
                                              ? "PyPi"
                                              : "Package"}
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
                        </span>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default Projects;
