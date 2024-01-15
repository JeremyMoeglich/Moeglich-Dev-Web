import { typed_from_entries } from "functional-utilities";
import Link from "next/link";
import { projects } from "~/data/projects";
import { technologies } from "~/data/tech";

const link_map = {
    ...typed_from_entries(
        technologies.map((tech) => [
            tech.name,
            {
                ...tech,
                kind: "tech",
            },
        ]),
    ),
    ...typed_from_entries(
        projects.map((project) => [
            project.name,
            {
                ...project,
                kind: "project",
            },
        ]),
    ),
};

export function TLink({ name }: { name: keyof typeof link_map }) {
    return <Link href={`/${link_map[name].kind}/${name}`}>{name}</Link>;
}
