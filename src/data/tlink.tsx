import { typed_from_entries } from "functional-utilities";
import Link from "next/link";
import type { Page } from "puppeteer";
import * as Icons from "~/app/_components/icons";

export const projects = [
    {
        name: "Tagaro",
        summary: "Onlineshop für Sky",
        description: {
            de: () => (
                <div className="article">
                    <p>
                        Tagaro ist ein Onlineshop für Sky bei dem Ich schon für
                        mehrere Jahre Onlineshop, Bestellungs Automatisierung
                        und allgemein alles IT mache.
                    </p>
                    <div>
                        Das Tagaro Project ist eine Monorepo mit Turborepo +
                        pnpm und enthält diese Projekte
                        <ul>
                            <li>
                                Eine Website mit <TLink name="Sveltekit" /> als
                                Metaframework und Typescript als Sprache. <br />
                                Weitere Technologien:
                                <ul>
                                    <li>
                                        <TLink name="Turborepo" />: Monorepo
                                    </li>
                                    <li>
                                        <TLink name="Vercel" /> +{" "}
                                        <TLink name="Strato" />: Hosting
                                    </li>
                                    <li>
                                        <TLink name="Tailwind" /> +{" "}
                                        <TLink name="Scss" /> +{" "}
                                        <TLink name="Postcss" />: Styling
                                    </li>
                                    <li>
                                        <TLink name="Firebase" />: Logging,
                                        Kontaktformulare
                                    </li>
                                    <li>
                                        <TLink name="Google Analytics" />
                                    </li>
                                    <li>
                                        <TLink name="Github Actions" />: CI/CD,
                                        Deployments
                                    </li>
                                </ul>
                            </li>
                            <li>
                                Ein Admin Panel (ebenfalls{" "}
                                <TLink name="Sveltekit" />,
                                <TLink name="Typescript" />) welches Tools wie
                                ein Email Generator, einsicht auf Logs oder ein
                                Paketbild Generator enthält <br />
                                Weitere Technologien:
                                <ul>
                                    <li>
                                        <TLink name="Prisma" /> +{" "}
                                        <TLink name="CockroachDb" />: Datenbank
                                        zum Speichern von Accounts
                                    </li>
                                    <li>
                                        <TLink name="Vercel" />: Hosting
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            ),
        },
        icon: "/images/projects/tagaro_icon.svg",
        image: "/images/projects/tagaro_site.png",
        site_url: "https://tagaro.de",
        site_load_action: async (site: Page) => {
            const el = await site.waitForSelector(
                "p.blue::-p-text(Alle Akzeptieren)",
            );
            if (!el) throw new Error("Could not find accept button");
            await el.click();
        },
        github_url: "https://github.com/JeremyMoeglich/Tagaro-Monorepo",
    },
    {
        name: "Moeglich.dev",
        summary: "Diese Website",
        description: {
            de: () => (
                <div className="article">
                    <p>
                        Diese Website ist meine persönliche Website und
                        Portfolio. Sie ist mit <TLink name="Next" /> und{" "}
                        <TLink name="React" /> geschrieben und verwendet{" "}
                        <TLink name="Tailwind" /> fürs Styling.
                    </p>
                    <div>
                        Weitere Technologien:
                        <ul>
                            <li>
                                <TLink name="Vercel" />: Hosting
                            </li>
                            <li>
                                <TLink name="TRPC" />: Backend API
                            </li>
                        </ul>
                    </div>
                </div>
            ),
        },
        icon: "favicon.svg",
        image: "/images/projects/moeglichdev_site.png",
        site_url: "https://moeglich.dev",
        github_url: "https://github.com/JeremyMoeglich/Moeglich-Dev-Web",
    },
    {
        name: "ErcEsg",
        summary: "Website für ERC Heessen",
        description: {
            de: () => (
                <div className="article">
                    <p>
                        ErcEsg ist eine Schülerfirma des Schloss Heessen (meiner
                        Schule), Ich habe den IT Bereich geleitet und z.B. die
                        Website erstellt. <br />
                        Die Website wurde nach <TLink name="Tagaro" /> erstellt
                        und basiert auf einem ähnlichen Stack (
                        <TLink name="Sveltekit" /> + <TLink name="Typescript" />
                        ). <br />
                        Das Projekt ist kleiner, aber dynamischer, da es ein
                        Artikel und Account System enthält.
                    </p>
                    <p>
                        Das Artikel System ist Custom, das Frontend interagiert
                        mit einer Rest API welche mit <TLink name="Prisma" />{" "}
                        auf die <TLink name="CockroachDb" /> Datenbank zugreift.
                    </p>
                    <p>
                        Die Seite + API wird mit <TLink name="Vercel" /> Edge
                        Functions gehostet
                    </p>
                </div>
            ),
        },
        icon: "images/projects/ercesg_icon.png",
        image: "/images/projects/ercesg_site.png",
        site_url: "https://erc-heessen.de",
        github_url: "https://github.com/JeremyMoeglich/erc-esg",
    },
    {
        name: "Japtools",
        summary: "Eine Sprachlernwebseite",
        description: {
            de: () => <div className="article"></div>,
        },
        icon: "images/projects/japtools_icon.png",
        image: "/images/projects/japtools_site.png",
        site_url: "https://japtools.moeglich.dev",
        github_url: "https://github.com/JeremyMoeglich/japtools",
    },
    {
        name: "functional_utilities",
        summary: "Ein utility NPM Package",
        description: () => (
            <div className="article">
                <p>
                    Ein NPM Package mit vielen Funktionen die ich in fast allen
                    meiner Projekte benutze.
                </p>
                <p>
                    Das Package ist in Typescript geschrieben und enthält
                    Funktionen fürs Arbeiten mit Arrays, Objekten, Strings und
                    mehr. Ein Fokus sind Types
                </p>
            </div>
        ),
        icon: "images/projects/npm_icon.svg",
        image: "/images/projects/npm_default.svg",
        package_url: "https://www.npmjs.com/package/functional-utilities",
        github_url: "https://github.com/JeremyMoeglich/functional_utilities",
    },
    {
        name: "Quip",
        summary: "Eine Programmiersprache",
        description: "todo",
        icon: "images/projects/quip_icon.png",
        image: "/images/projects/quip_image.svg",
        github_url: "https://github.com/JeremyMoeglich/quip",
    },
    {
        name: "list_screen",
        summary: "Ein Python Package fürs Terminal",
        description: "todo",
        icon: "images/projects/pypi_icon.svg",
        image: "/images/projects/pypi_default.svg",
        package_url: "https://pypi.org/project/list-screen/",
    },
    {
        name: "tsgridlib",
        summary: "Ein Grid NPM Package",
        description: "todo",
        icon: "images/projects/npm_icon.svg",
        image: "/images/projects/npm_default.svg",
        package_url: "https://www.npmjs.com/package/tsgridlib",
    },
    {
        name: "Satworld",
        summary: "Ein Onlineshop",
        description: "todo",
        icon: "images/projects/satworld_icon.svg",
        image: "/images/projects/satworld_site.png",
        site_url: "http://newshopware.satworldit.de/",
    },
] as const;

export const technologies = [
    {
        icon: () => <Icons.ReactIcon />,
        name: "React",
        description: "todo",
    },
    {
        icon: () => <Icons.TailwindIcon />,
        name: "Tailwind",
        description: "todo",
    },
    {
        icon: () => <Icons.NextJsIcon />,
        name: "Next",
        description: "todo",
    },
    {
        icon: () => <Icons.QwikIcon />,
        name: "Qwik",
        description: "todo",
    },
    {
        icon: () => <Icons.PythonIcon />,
        name: "Python",
        description: "todo",
    },
    {
        icon: () => <Icons.NodeJsIcon />,
        name: "Node",
        description: "todo",
    },
    {
        icon: () => <Icons.PytorchIcon />,
        name: "Pytorch",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Sveltekit",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Typescript",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Scss",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Postcss",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Firebase",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Google Analytics",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Prisma",
        description: "todo",
    },
    {
        icon: "temp",
        name: "CockroachDb",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Docker",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Nginx",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Git",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Github Actions",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Linux",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Vercel",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Strato",
        description: "todo",
    },
    {
        icon: "temp",
        name: "Turborepo",
        description: "todo",
    },
    {
        icon: "temp",
        name: "TRPC",
        description: "todo",
    },
] as const;

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
    return (
        <Link href={`/overview/${link_map[name].kind}/${name}`}>{name}</Link>
    );
}

export function TLinkComponent({
    name,
    children,
    className,
}: {
    name: keyof typeof link_map;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Link
            href={`/overview/${link_map[name].kind}/${name}`}
            className={className}
        >
            {children}
        </Link>
    );
}
