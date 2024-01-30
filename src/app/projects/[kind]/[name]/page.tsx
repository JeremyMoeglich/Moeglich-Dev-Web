"use client";

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
            <div className="mx-auto max-w-2xl px-4">
                <h1 className="text-3xl font-bold">{title}</h1>
                <p>
                    {typeof description === "string"
                        ? description
                        : typeof description.de === "string"
                          ? description.de
                          : description.de()}
                </p>
            </div>
        </Layout>
    );
}
