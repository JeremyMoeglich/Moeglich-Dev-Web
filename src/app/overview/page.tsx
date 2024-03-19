"use client";

import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { type NextPage } from "next";
import { Layout } from "~/app/_components/Layout";
import { TLinkComponent, projects } from "~/data/tlink";
import { useState } from "react";
import jaro from "jaro-winkler";
import { SearchBar } from "../_components/search_bar";

const Projects: NextPage = () => {
    const [search, setSearch] = useState("");
    return (
        <Layout>
            <div className="flex flex-col rounded gap-4">
                <div className="flex justify-center">
                    <SearchBar search={search} onChange={setSearch} />
                </div>
                <div>
                    <div className="grid max-w-[2000px] grid-cols-1 gap-4 px-4 shadow text-white sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {projects
                            .map((p) => {
                                const t1 = p.name.toLowerCase();
                                const t2 = p.summary.toLowerCase();

                                const s = search.toLowerCase();

                                const s1 =
                                    jaro(t1, s) * 1.5 + Number(t1.includes(s));
                                const s2 =
                                    jaro(t2, s) * 1.3 + Number(t2.includes(s));
                                const s3 =
                                    Math.max(
                                        ...p.tags.map(
                                            (t) =>
                                                jaro(t.toLowerCase(), s) +
                                                Number(t.includes(s)),
                                        ),
                                    ) * 1.2;

                                return {
                                    p,
                                    score: Math.max(s1, s2, s3),
                                };
                            })
                            .filter((p) => p.score > 0.8)
                            .sort((a, b) => b.score - a.score)
                            .map((p) => p.p)
                            .map((p) => (
                                <motion.div
                                    key={p.name}
                                    layoutId={`${p.name}-box`}
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
                                </motion.div>
                            ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Projects;
