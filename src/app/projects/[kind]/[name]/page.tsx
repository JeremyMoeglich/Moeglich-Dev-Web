"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Layout } from "~/code/components/Layout";
import { projects, technologies } from "~/data/tlink";
export default function Page() {
    const { kind, name } = useParams<{
        kind: string;
        name: string;
    }>();

    const found =
        kind === "tech"
            ? technologies.find((t) => t.name === name)
            : kind === "project"
              ? projects.find((p) => p.name === name)
              : undefined;

    if (!found) {
        return <div>Not found</div>;
    }

    const { description, name: title } = found;

    return (
        <Layout>
            <div className="mx-auto flex w-3/4 max-w-[2000px] flex-col gap-8 px-4 text-white">
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col ">
                        <button
                            className="text-white w-fit"
                            onClick={() => history.back()}
                        >
                            ← Back
                        </button>
                        <h1 className="text-4xl font-bold">{title}</h1>
                        {"summary" in found && <p>{found.summary}</p>}
                    </div>
                    {"image" in found && (
                        <motion.img
                            src={found.image}
                            alt={title}
                            className="mx-auto w-[1000px] max-w-full rounded-md border-[1px] border-gray-500 shadow-md"
                            layoutId={title}
                        />
                    )}
                </div>
                {typeof description === "string"
                    ? description
                    : typeof description.de === "string"
                      ? description.de
                      : description.de()}
            </div>
        </Layout>
    );
}
