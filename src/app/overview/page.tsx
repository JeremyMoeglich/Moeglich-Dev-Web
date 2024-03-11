"use client";

import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { type NextPage } from "next";
import { Layout } from "~/app/_components/Layout";
import { TLinkComponent, projects } from "~/data/tlink";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "~/@/components/ui/input";
import { CgSearch } from "react-icons/cg";
import { useState } from "react";

const Projects: NextPage = () => {
    const [search, setSearch] = useState("");
    return (
        <Layout>
            <div className="flex flex-col rounded gap-4">
                <div className="flex justify-center">
                    <div className="flex p-1 gap-4 items-center bg-blue-800 shadow-lg rounded-full backdrop-blur-sm bg-opacity-40 border-[1px] border-black border-opacity-20">
                        <CgSearch size={32} color="white" />
                        <Input
                            type="search"
                            placeholder="Search"
                            className="bg-slate-200 rounded-full border-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <div className="grid max-w-[2000px] grid-cols-1 gap-4 px-4 shadow text-white sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {projects
                            .filter((p) =>
                                p.name
                                    .toLowerCase()
                                    .includes(search.toLowerCase()),
                            )
                            .map((p) => (
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
                                        <p className="">{p.summary}</p>
                                    )}
                                    <span className="flex gap-2 items-center text-lg">
                                        <h3 className="text-2xl font-bold">
                                            {p.name}
                                        </h3>
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
                                                    {p.package_url.includes(
                                                        "npmjs.com",
                                                    )
                                                        ? "NPM"
                                                        : p.package_url.includes(
                                                                  "pypi.org",
                                                              )
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
                </div>
            </div>
        </Layout>
    );
};

export default Projects;
