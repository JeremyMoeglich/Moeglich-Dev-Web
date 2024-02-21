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
                <div>
                    Ein <TLink name="NPM" /> Package mit vielen Funktionen die
                    ich in fast allen meiner Projekte benutze. Einige Beispiele
                    sind:
                    <ul>
                        <li>
                            <TLink name="Tagaro" />
                        </li>
                        <li>
                            <TLink name="ErcEsg" />
                        </li>
                        <li>
                            <TLink name="Moeglich.dev" />
                        </li>
                        <li>
                            <TLink name="Japtools" />
                        </li>
                    </ul>
                </div>
                <p>
                    Das Package ist in <TLink name="Typescript" />
                    geschrieben und enthält Funktionen fürs Arbeiten mit Arrays,
                    Objekten, Strings und mehr. Einige Ziele sind Gute Types und
                    Einfachheit.
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
        description: () => (
            <div className="article">
                <p>
                    Ein{" "}
                    <li>
                        <TLink name="Python" />
                    </li>{" "}
                    Package mit dem Ziel multi-line Texte im Terminal einfach
                    darzustellen. Es funktioniert indem man eine Liste von
                    Strings der Library gibt, diese wird dann automatisch den
                    Aktuellen Inhalt des Terminals anpassen.
                </p>
            </div>
        ),
        icon: "images/projects/pypi_icon.svg",
        image: "/images/projects/pypi_default.svg",
        package_url: "https://pypi.org/project/list-screen/",
    },
    {
        name: "tsgridlib",
        summary: "Ein Grid NPM Package",
        description: () => (
            <div className="article">
                <p>
                    Ein{" "}
                    <li>
                        <TLink name="NPM" />
                    </li>{" "}
                    Package welches die darstellung und manipulation von Grids
                    in <TLink name="Typescript" /> vereinfacht. Ich nutze es in
                    nur wenigen Projekten, aber es ist sehr nützlich wenn es
                    gebraucht wird.
                </p>
                ,
            </div>
        ),
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
        description: () => (
            <div className="article">
                <p>
                    React ist das Framework meiner Wahl für Frontend
                    Entwicklung. Die meisten Projekte wo ich es nutzte sind
                    aktuell Privat, aber ein beispiel ist diese Seite{" "}
                    <TLink name="Moeglich.dev" />
                </p>
                <p>
                    Der Grund warum ich React nutze ist das es sehr flexibel
                    ist, abstraktionen wie Hooks und Higher Order Components
                    erlauben es Probleme gut darzustellen und zu lösen.
                </p>
                <p>
                    Allgemein nutze Ich React mit <TLink name="Typescript" />,{" "}
                    <TLink name="Tailwind" /> und <TLink name="Next" /> dar es
                    die Vorteile von React herausbringt und die Nachteile
                    reduziert
                </p>
            </div>
        ),
    },
    {
        icon: () => <Icons.TailwindIcon />,
        name: "Tailwind",
        description: () => (
            <div className="article">
                <p>
                    Tailwind mach Styling einfacher, besonders wenn das CSS kein
                    Scoping hat (wie in <TLink name="React" />/
                    <TLink name="Next" />
                    ). <br />
                    Deshalb nutze Ich es in allen meiner <TLink name="Next" />{" "}
                    Projekte.
                </p>
                <p>
                    Es gibt auch Projekte wo Ich es nicht nutze, diese sind
                    hauptzächlich in <TLink name="Sveltekit" /> geschrieben, da
                    Sveltekit CSS auf die Dateien isoliert. Aber auch in diesen
                    wechsle Ich langsam zu Tailwind, z.B. in{" "}
                    <TLink name="Tagaro" />
                </p>
            </div>
        ),
    },
    {
        icon: () => <Icons.NextJsIcon />,
        name: "Next",
        description: () => (
            <div className="article">
                <p>
                    Next ist ein Metaframework für React welches Server Side
                    Rendering, Static Site Generation und mehr erlaubt. Es ist
                    das Framework meiner Wahl für Webseiten, da es sehr flexibel
                    ist und gut mit den Technologien die Ich nutze
                    zusammenarbeitet.
                </p>
                <p>
                    Ein Beispiel Projekt ist diese Seite{" "}
                    <TLink name="Moeglich.dev" />
                </p>
            </div>
        ),
    },
    {
        icon: () => <Icons.QwikIcon />,
        name: "Qwik",
        description: "todo",
    },
    {
        icon: () => <Icons.PythonIcon />,
        name: "Python",
        description: () => (
            <div className="article">
                <p>
                    Python war die erste "richtige" Programmiersprache die Ich
                    gelernt habe, aber mittlerweile nutze Ich sie nur noch für
                    kleine Scripts.
                </p>
                <p>
                    Die meisten meiner Python Projekte habe Ich zu einer Zeit
                    geschrieben wo Ich noch nicht alle meine Projekte auf Github
                    gepostet habe, deshalb gibt es nur wenige Beispiele wie z.B.
                    <TLink name="list_screen" />
                </p>
            </div>
        ),
    },
    {
        icon: () => <Icons.NodeJsIcon />,
        name: "Node",
        description: () => (
            <div className="article">
                <p>
                    Node nutze Ich hauptzächlich für Scripts in{" "}
                    <TLink name="Typescript" /> Projekten und wenn Ich Bots oder
                    komplexere Scripts schreibe.
                </p>
                <p>
                    Die meisten meiner <TLink name="Typescript" /> Projekte sind
                    jedoch nicht nur für Node, sondern auch für den Browser oder
                    andere Runtimes wie <TLink name="Vercel" /> Edge Functions.
                </p>
            </div>
        ),
    },
    // {
    //     icon: () => <Icons.PytorchIcon />,
    //     name: "Pytorch",
    //     description: "todo",
    // },
    {
        icon: "temp",
        name: "Sveltekit",
        description: () => (
            <div className="article">
                <p>
                    SvelteKit ist ein Metaframework für den Aufbau von
                    Webanwendungen. Es ist das erste Webframework, das ich
                    verwendet habe, es ist einfach und effizient.
                </p>
                <p>
                    Ich nutze SvelteKit in Projekten wie <TLink name="Tagaro" />{" "}
                    und <TLink name="ErcEsg" />, wo es mir ermöglicht, schnell
                    interaktive und performante Webseiten zu erstellen. Durch
                    die Kombination von SvelteKit mit anderen Technologien wie{" "}
                    <TLink name="Typescript" />, <TLink name="Tailwind" />, und{" "}
                    <TLink name="Postcss" /> kann Sveltekit eine relativ gute DX
                    bieten.
                </p>
                <p>
                    Sveltekit ist das was Ich für die meisten meiner aktiven
                    Projekte genutzt habe, aber mittlerweile bevorzuge Ich{" "}
                    <TLink name="Next" /> für neue Projekte, da es mehr Features
                    hat und besser mit den Technologien die Ich nutze
                    zusammenarbeitet.
                </p>
            </div>
        ),
    },

    {
        icon: "temp",
        name: "Typescript",
        description: () => {
            return (
                <div className="article">
                    <p>
                        Typescript ist die Sprache meiner Wahl für Web und viele
                        Scripts. Ich nutze fast nie Javascript ohne Typescript
                        dar es mir viele Vorteile gibt wie bessere DX durch
                        Types
                    </p>
                    <div>
                        Einige Beispiele wo Ich Typescript nutze sind:
                        <ul>
                            <li>
                                <TLink name="Tagaro" />
                            </li>
                            <li>
                                <TLink name="ErcEsg" />
                            </li>
                            <li>
                                <TLink name="Moeglich.dev" />
                            </li>
                            <li>
                                <TLink name="Japtools" />
                            </li>
                        </ul>
                    </div>
                    <p>
                        Typescript ist eine der Zwei Sprachen welche Ich für
                        fast alle Projekte nutze, die andere ist{" "}
                        <TLink name="Rust" />
                    </p>
                </div>
            );
        },
    },
    {
        icon: "temp",
        name: "Rust",
        description: () => (
            <div className="article">
                <p>
                    Rust ist die Sprache meiner Wahl für Projekte mit komplexer
                    Logik, hoher Performance oder Systems Level Programming.
                    Einige Beispiele sind:
                    <ul>
                        <li>
                            <TLink name="Quip" /> - Rust wird für die erste
                            Version der Sprache genutzt zum Bootstrapping
                        </li>
                        <li>
                            <TLink name="Moeglich.dev" /> - Rust wird für einige
                            Scripts genutzt z.B. für das Bundlen von Beispiel
                            Code
                        </li>
                        <li>
                            <TLink name="Japtools" /> - Rust wird für das
                            erstellen der Daten für die Datenbank (
                            <TLink name="CockroachDb" />) genutzt
                        </li>
                    </ul>
                    Wie <TLink name="Next" /> nutze Ich Rust immer mehr und die
                    meisten Projekte wo Ich Rust nutze sind noch nicht fertig /
                    veröffentlicht.
                </p>
            </div>
        ),
    },
    {
        icon: "temp",
        name: "Scss",
        description: () => (
            <div className="article">
                <p>
                    Scss ist eine CSS Preprocessor die Ich in Projekten wie{" "}
                    <TLink name="Tagaro" /> nutze. Ich bevorzuge es gegenüber
                    CSS, aber <TLink name="Tailwind" /> ist in den meisten
                    Fällen besser.
                </p>
            </div>
        ),
    },
    {
        icon: "temp",
        name: "Postcss",
        description: () => (
            <div className="article">
                <p>
                    Postcss ist nutze Ich selten direkt, aber es ist ein
                    wichtiger Teil von anderen CSS Tools wie{" "}
                    <TLink name="Tailwind" /> oder <TLink name="Scss" />
                </p>
            </div>
        ),
    },
    {
        icon: "temp",
        name: "Firebase",
        description: () => (
            <div className="article">
                <p>
                    Firebase ist ein Cloud Service von Google welcher viele
                    Services anbietet. Ich nutze aber nur die Datenbank um z.B.
                    in <TLink name="Tagaro" /> Kontaktformulare oder Logs zu
                    speichern.
                </p>
                <p>
                    Ich bevorzuge <TLink name="CockroachDb" /> +{" "}
                    <TLink name="Prisma" /> für die meisten Projekte, aber
                    Firebase hat den Vorteil der Echtzeit was es für Realtime
                    Logs oder Status Updates nützlich macht.
                </p>
            </div>
        ),
    },
    {
        icon: "temp",
        name: "Google Analytics",
        description: () => (
            <div className="article">
                <p>
                    Google Analytics ist ein Tool um das Verhalten von Nutzern
                    auf einer Webseite zu analysieren. Ich nutze es aktuell nur
                    in <TLink name="Tagaro" />. Um möglicherweise verbesserungen
                    in der SEO zu finden oder zu sehen wie Nutzer die Seite
                    nutzen.
                </p>
            </div>
        ),
    },
    {
        icon: "temp",
        name: "Prisma",
        description: () => (
            <div className="article">
                <p>
                    Prisma ist meine bevorzugte möglichkeit mit Datenbanken zu
                    interagieren. Ich nutze es meisten in Kombination mit{" "}
                    <TLink name="CockroachDb" /> habe es aber auch schon mit
                    anderen Datenbanken wie Postgres oder MySQL genutzt.
                </p>
                <div>
                    Einige Beispiele wo Ich Prisma nutze sind:
                    <ul>
                        <li>
                            <TLink name="Tagaro" />
                        </li>
                        <li>
                            <TLink name="Japtools" />
                        </li>
                        <li>
                            <TLink name="ErcEsg" />
                        </li>
                        <li>
                            <TLink name="Moeglich.dev" />
                        </li>
                    </ul>
                </div>
            </div>
        ),
    },
    {
        icon: "temp",
        name: "Pusher",
        description: () => (
            <div className="article">
                <p>
                    Pusher ist ein Service um Echtzeit Daten zu senden. Es ist
                    das was Ich nutze wenn Ich <TLink name="CockroachDb" /> +{" "}
                    <TLink name="Prisma" /> nutze welche keine Echtzeit Updates
                    haben.
                </p>
                <div>
                    Ich nutze Pusher in 2 Projekten:
                    <ul>
                        <li>
                            <TLink name="Moeglich.dev" /> - Echtzeit Updates wie Counters
                        </li>
                        <li>
                            Ein Projekt welches noch nicht veröffentlicht ist,
                            es ist ein Online Multiplayer Spiel was Echtzeit
                            Updates braucht
                        </li>
                    </ul>
                </div>
            </div>
        ),
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
    {
        icon: "temp",
        name: "NPM",
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
