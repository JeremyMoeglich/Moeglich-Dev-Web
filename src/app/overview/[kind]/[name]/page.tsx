"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Layout } from "~/app/_components/Layout";
import { I18 } from "~/app/_components/i18";
import { TLinkNameCollector, projects, technologies } from "~/data/tlink";

export default function Page() {
    const [names, setNames] = useState<string[]>([]);
    const { name: name_unprocessed, kind } = useParams<{
        name: string;
        kind: string;
    }>();
    const name = name_unprocessed.replaceAll("_", " ");

    const found =
        kind === "project"
            ? projects.find((p) => p.name === name)
            : technologies.find((p) => p.name === name);

    if (!found) {
        return <div>Not found</div>;
    }

    const { description, name: title } = found;

    return (
        <Layout>
            <div className="mx-auto flex sm:w-3/4 max-w-[2000px] flex-col gap-8 px-4 text-white">
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col">
                        <button
                            className="w-fit text-white"
                            type="button"
                            onClick={() => history.back()}
                        >
                            ← Back
                        </button>
                        <h1 className="text-4xl font-bold">{title}</h1>
                        {"summary" in found && <p>{found.summary}</p>}
                    </div>
                    {"image" in found && (
                        <img
                            src={found.image}
                            alt={title}
                            className="mx-auto w-[1000px] max-w-full rounded-md border-[1px] border-gray-500 shadow-md"
                        />
                    )}
                </div>
                <div className="bg-slate-700 bg-opacity-50 p-4 backdrop-blur-lg">
                    {names}
                    <TLinkNameCollector onNameChange={(new_names) => {}}>
                        <I18 content={description} />
                    </TLinkNameCollector>
                </div>
            </div>
        </Layout>
    );
}
