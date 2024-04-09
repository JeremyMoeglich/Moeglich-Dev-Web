import { typed_from_entries } from "functional-utilities";
import Link from "next/link";
import type { Page } from "puppeteer";
import {
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { CgArrowRight } from "react-icons/cg";
import * as Icons from "~/app/_components/icons";

export const projects = [
    {
        name: "Tagaro",
        summary: "Onlineshop für Sky",
        description: {
            de: () => (
                <div className="article">
                    <div>
                        Tagaro ist ein Onlineshop für Sky bei dem Ich schon für
                        mehrere Jahre Onlineshop, Bestellungs Automatisierung
                        und allgemein alles IT mache.
                    </div>
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
        tags: [
            "Tagaro",
            "Sveltekit",
            "Typescript",
            "Turborepo",
            "Vercel",
            "Strato",
            "Website",
            "Admin Panel",
            "Firebase",
            "Google Analytics",
            "Github Actions",
            "Prisma",
            "CockroachDb",
            "Node",
            "Scss",
        ],
    },
    {
        name: "Moeglich.dev",
        summary: "Diese Website",
        description: {
            de: () => (
                <div className="article">
                    <div>
                        moeglich.dev ist meine persönliche Website und
                        Portfolio. Sie ist mit <TLink name="Next" /> und{" "}
                        <TLink name="React" /> geschrieben und verwendet{" "}
                        <TLink name="Tailwind" /> fürs Styling.
                    </div>
                    <div>
                        Die Seite enthält auch einige von mir geschriebene
                        Libraries:
                        <div>
                            <ul>
                                <li>
                                    <TLink name="functional_utilities" /> - Eine
                                    Utility Library für Typescript
                                </li>
                                <li>
                                    <TLink name="tgpu" /> - Eine Library für
                                    einfache und sichere GPU Programmierung
                                </li>
                                <li>
                                    <TLink name="tshapes" /> - Eine Library fürs
                                    Arbeiten mit Formen und Rendering
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        Weitere genutzte Technologien:
                        <ul>
                            <li>
                                <TLink name="Vercel" />: Hosting, CI Builds
                            </li>
                            <li>
                                <TLink name="TRPC" />: Backend API
                            </li>
                            <li>
                                <TLink name="Biome" />: Lint, Format
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
        tags: [
            "Moeglich.dev",
            "Next",
            "React",
            "Tailwind",
            "Vercel",
            "TRPC",
            "Biome",
            "functional_utilities",
            "tgpu",
            "tshapes",
        ],
    },
    {
        name: "ErcEsg",
        summary: "Website für ERC Heessen",
        description: {
            de: () => (
                <div className="article">
                    <div>
                        ErcEsg ist eine Schülerfirma des Schloss Heessen (meiner
                        Schule), Ich habe den IT Bereich geleitet und z.B. die
                        Website erstellt. <br />
                        Die Website wurde nach <TLink name="Tagaro" /> erstellt
                        und basiert auf einem ähnlichen Stack (
                        <TLink name="Sveltekit" /> + <TLink name="Typescript" />
                        ). <br />
                        Das Projekt ist kleiner, aber dynamischer, da es ein
                        Artikel und Account System enthält.
                    </div>
                    <div>
                        Das Artikel System ist Custom, das Frontend interagiert
                        mit einer Rest API welche mit <TLink name="Prisma" />{" "}
                        auf die <TLink name="CockroachDb" /> Datenbank zugreift.
                    </div>
                    <div>
                        Die Seite + API wird mit <TLink name="Vercel" /> Edge
                        Functions gehostet
                    </div>
                </div>
            ),
        },
        icon: "images/projects/ercesg_icon.png",
        image: "/images/projects/ercesg_site.png",
        site_url: "https://erc-heessen.de",
        github_url: "https://github.com/JeremyMoeglich/erc-esg",
        tags: [
            "ErcEsg",
            "Sveltekit",
            "Typescript",
            "Vercel",
            "Prisma",
            "CockroachDb",
            "Node",
        ],
    },
    {
        name: "Japtools",
        summary: "Eine Sprachlernwebseite",
        description: {
            de: () => <div className="article" />,
        },
        icon: "images/projects/japtools_icon.png",
        image: "/images/projects/japtools_site.png",
        site_url: "https://japtools.moeglich.dev",
        github_url: "https://github.com/JeremyMoeglich/japtools",
        tags: ["Japtools", "Sveltekit", "Typescript", "Vercel"],
    },
    {
        name: "functional_utilities",
        summary: "Ein utility NPM Package",
        description: () => (
            <div className="article">
                <div>
                    Ein <TLink name="npm" /> Package mit vielen Funktionen die
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
                <div>
                    Das Package ist in <TLink name="Typescript" />
                    geschrieben und enthält Funktionen fürs Arbeiten mit Arrays,
                    Objekten, Strings und mehr. Einige Ziele sind Gute Types und
                    Einfachheit.
                </div>
            </div>
        ),
        icon: "images/projects/npm_icon.svg",
        image: "/images/projects/npm_default.svg",
        package_url: "https://www.npmjs.com/package/functional-utilities",
        github_url: "https://github.com/JeremyMoeglich/functional_utilities",
        tags: ["functional_utilities", "NPM", "Typescript"],
    },
    {
        name: "tgpu",
        summary: "Eine Library für einfache und sichere GPU Programmierung",
        description: () => (
            <div className="article">
                <div>
                    Eine Library für einfache und sichere GPU Programmierung in
                    Typescript. Aktuell unterstützt diese nur WebGl1 aber
                    WebGl2, WebGPU und Vulkan sind geplant.
                </div>
                <div>
                    Die Library ermöglicht es ohne jemals Shader, Buffer,
                    Uniforms oder ähnliches zu schreiben, komplexe Grafiken zu
                    erstellen oder Berechnungen auf der GPU auszuführen.
                </div>
            </div>
        ),
        icon: "/images/projects/tgpu_icon.svg",
        image: "/images/projects/tgpu_image.svg",
        github_url:
            "https://github.com/JeremyMoeglich/Moeglich-Dev-Web/tree/main/src/code/tgpu",
        tags: [
            "tgpu",
            "Typescript",
            "WebGl",
            "WebGPU",
            "Vulkan",
            "functional_utilities",
            "tshapes",
        ],
    },
    {
        name: "Quip",
        summary: "Eine Programmiersprache",
        description: () => (
            <div>
                <p>
                    Quip steht für eine neue Perspektive in der Welt der
                    Programmiersprachen und ist derzeit aktiv in Entwicklung. Es
                    ist mit der Vision entstanden, Programmieren einfacher und
                    mächtiger zu gestalten und neuen Entwicklern einen enfachen
                    Weg in die Tiefen der Programmierung zu bieten. Obwohl Quip
                    noch in der Entwicklungsphase ist, demonstrieren seine
                    grundlegenden Prinzipien und innovativen Funktionen einen
                    vielversprechenden Weg in die Zukunft der Programmierung.
                </p>

                <h3>Einfachheit im Fokus</h3>
                <p>
                    Im Zentrum von Quip steht das Ziel, unnötige Komplexität zu
                    reduzieren. Es legt den Fokus auf ein Design, das sowohl
                    mächtig als auch einfach ist. Dieser Ansatz ermöglicht es
                    Entwicklern, sich auf das Lösen von Problemen zu
                    konzentrieren, anstatt mit der Sprache limitiert zu werden
                </p>

                <h3>Besondere Eigenschaften</h3>
                <ul>
                    <li>
                        <strong>Abstrakt als Performance Vorteil</strong>: Die
                        meisten Sprachen haben ein Tradeoff zwischen Abstraktion
                        & Performance Quip hat das gegenteil, es nutzt
                        Abstraktion um Performance zu verbessern indem diese dem
                        Compiler mehr Verständnis und Freiheiten geben.
                    </li>
                    <li>
                        <strong>&quot;Everything is a value&quot;</strong>: In
                        Quip ist alles ein Wert, sogar der Compiler selbst ist
                        ein Wert in der Standard Library. Dies ermöglicht es
                        alle Konzepte mit den selben Mitteln (Funktionen) zu
                        manipulieren.
                    </li>
                    <li>
                        <strong>Environments</strong>: Quip hat ein neues
                        Konzept namens Environments, es beschreibt die Umgebung
                        wo der Code läuft mit Capabilities und Requirements.{" "}
                        <br />
                        Capabilities sind Dinge die die Umgebung kann, z.B.
                        Filesystem, Netzwerk, etc. <br />
                        Requirements sind Dinge die die Umgebung braucht, z.B.
                        braucht eine Website ein User Interface. Oder eine
                        Executable eine main Funktion.
                    </li>
                    <li>
                        <strong>Dynamische Typenanpassung</strong>: Quip
                        ermöglicht die Anpassung von Variablentypen basierend
                        auf Laufzeitbedingungen während Compilation, das erlaubt
                        die Performance und Sicherheit von statischen Typen mit
                        der Flexibilität von dynamischen Typen.
                    </li>
                    <li>
                        <strong>Ausrichtung auf Traits</strong>: Im Zentrum von
                        Quips Philosophie steht die innovative Nutzung von
                        Traits zur Verhaltensdefinition, was einen modularen und
                        wiederverwendbaren Ansatz zur Funktionsentwicklung
                        ermöglicht.
                    </li>
                    <li>
                        <strong>Umgang mit Union-Typen</strong>: Quip behandelt
                        fortgeschrittene Konzepte wie Union-Typen auf eine
                        benutzerfreundliche Art und Weise, was komplexe
                        Typoperationen zugänglich und leistungsfähig macht.
                    </li>
                </ul>

                <h3>Zukunftsorientierte Entwicklung</h3>

                <p>
                    Die Entwicklung von Quip ist ein offener Prozess, der neue
                    Ideen und Beiträge willkommen heißt. Die Sprache entwickelt
                    sich ständig weiter, indem sie bestehende Konventionen
                    hinterfragt, immer mit dem Ziel, die Erfahrung der
                    Entwickler zu verbessern.
                </p>

                <h3>Für die Herausforderungen von morgen entwickelt</h3>

                <p>
                    Quip hat das Ziel, Entwicklern Werkzeuge an die Hand zu
                    geben, die für die modernen Herausforderungen in der
                    Softwareentwicklung gerüstet sind. Es geht dabei nicht nur
                    um die Schaffung einer weiteren Programmiersprache, sondern
                    um eine Neugestaltung der Art und Weise, wie wir Ideen und
                    Logik im Code ausdrücken.
                </p>
            </div>
        ),
        icon: "images/projects/quip_icon.png",
        image: "/images/projects/quip_image.svg",
        github_url: "https://github.com/JeremyMoeglich/quip",
        tags: ["Quip", "Rust", "Programming Language"],
    },
    {
        name: "list_screen",
        summary: "Ein Python Package fürs Terminal",
        description: () => (
            <div className="article">
                <div>
                    Ein{" "}
                    <li>
                        <TLink name="Python" />
                    </li>{" "}
                    Package mit dem Ziel multi-line Texte im Terminal einfach
                    darzustellen. Es funktioniert indem man eine Liste von
                    Strings der Library gibt, diese wird dann automatisch den
                    Aktuellen Inhalt des Terminals anpassen.
                </div>
            </div>
        ),
        icon: "images/projects/pypi_icon.svg",
        image: "/images/projects/pypi_default.svg",
        package_url: "https://pypi.org/project/list-screen/",
        tags: ["list_screen", "Python", "Pypi"],
    },
    {
        name: "tsgridlib",
        summary: "Ein Grid NPM Package",
        description: () => (
            <div className="article">
                <div>
                    Ein{" "}
                    <li>
                        <TLink name="npm" />
                    </li>{" "}
                    Package welches die darstellung und manipulation von Grids
                    in <TLink name="Typescript" /> vereinfacht. Ich nutze es in
                    nur wenigen Projekten, aber es ist sehr nützlich wenn es
                    gebraucht wird.
                </div>
                ,
            </div>
        ),
        icon: "images/projects/npm_icon.svg",
        image: "/images/projects/npm_default.svg",
        package_url: "https://www.npmjs.com/package/tsgridlib",
        tags: ["tsgridlib", "NPM", "Typescript"],
    },
    {
        name: "Satworld",
        summary: "Ein Onlineshop",
        description: () => (
            <div className="article">
                <div>
                    Bei SatWorld und Atelmo, Anbietern im Satellitenbereich habe
                    Ich im Team in einer Migration zu einem Shopsystem, hierbei
                    habe Ich ein Migrationssystem in <TLink name="Rust" />{" "}
                    geschrieben und vieles mehr wie z.B. automatische Backups
                </div>
            </div>
        ),
        icon: "images/projects/satworld_icon.svg",
        image: "/images/projects/satworld_site.png",
        site_url: "http://newshopware.satworldit.de/",
        tags: [
            "Satworld",
            "Rust",
            "Shopware",
            "Python",
            "Company",
            "Shop",
            "Website",
        ],
    },
    {
        name: "Http-Websocket-Proxy",
        summary: "Ein Node Proxy Service",
        description: () => (
            <div className="article">
                <div>
                    Ein Node Service welcher http requests empfängt und dann an
                    listener via Websockets weiterleitet. Der Hauptzweck ist
                    Webhooks von zu empfangen auch wenn der Server nicht
                    öffentlich erreichbar ist oder die IP dynamisch ist.
                </div>
                <div>
                    Einige Beispiele wo Ich es nutze sind:
                    <ul>
                        <li>
                            <TLink name="Tagaro" />
                        </li>
                    </ul>
                </div>
            </div>
        ),
        icon: "images/projects/http_proxy_icon.svg",
        image: "/images/projects/http_proxy_image.svg",
        tags: ["Http-Websocket-Proxy", "Node", "Websockets"],
    },
    {
        name: "tshapes",
        summary: "Eine Library fürs Arbeiten mit Formen",
        description: () => (
            <div className="article">
                <div>
                    Tshapes ist eine Library fürs Arbeiten mit Formen in
                    Typescript. Das enthält vieles wie z.B. rendering,
                    collision, transformation, triangulation und vieles mehr.
                </div>
                <div>
                    Aktuell ist die Library in purem Typescript geschrieben aber
                    beschleunigung mit <TLink name="tgpu" /> und{" "}
                    <TLink name="Webassembly" /> via Rust ist in der Zukunft
                    geplant
                </div>
                <div>
                    Aktuell ist die Library Teil von{" "}
                    <TLink name="Moeglich.dev" />, aber Ich werde diese
                    vermutlich auf <TLink name="npm" /> veröffentlichen
                </div>
            </div>
        ),
        icon: "/images/projects/tshapes_icon.svg",
        image: "/images/projects/tshapes_image.svg",
        tags: ["tshapes", "Typescript", "WebGl", "WebGPU", "Vulkan"],
    },
] as const;

export const technologies = [
    {
        icon: () => <Icons.ReactIcon />,
        name: "React",
        description: () => (
            <div className="article">
                <div>
                    React ist das Framework meiner Wahl für Frontend
                    Entwicklung. Die meisten Projekte wo ich es nutzte sind
                    aktuell Privat, aber ein beispiel ist diese Seite{" "}
                    <TLink name="Moeglich.dev" />
                </div>
                <div>
                    Der Grund warum ich React nutze ist das es sehr flexibel
                    ist, abstraktionen wie Hooks und Higher Order Components
                    erlauben es Probleme gut darzustellen und zu lösen.
                </div>
                <div>
                    Allgemein nutze Ich React mit <TLink name="Typescript" />,{" "}
                    <TLink name="Tailwind" /> und <TLink name="Next" /> dar es
                    die Vorteile von React herausbringt und die Nachteile
                    reduziert
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.TailwindIcon />,
        name: "Tailwind",
        description: () => (
            <div className="article">
                <div>
                    Tailwind mach Styling einfacher, besonders wenn das CSS kein
                    Scoping hat (wie in <TLink name="React" />/
                    <TLink name="Next" />
                    ). <br />
                    Deshalb nutze Ich es in allen meiner <TLink name="Next" />{" "}
                    Projekte.
                </div>
                <div>
                    Es gibt auch Projekte wo Ich es nicht nutze, diese sind
                    hauptzächlich in <TLink name="Sveltekit" /> geschrieben, da
                    Sveltekit CSS auf die Dateien isoliert. Aber auch in diesen
                    wechsle Ich langsam zu Tailwind, z.B. in{" "}
                    <TLink name="Tagaro" />
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.NextJsIcon />,
        name: "Next",
        description: () => (
            <div className="article">
                <div>
                    Next ist ein Metaframework für React welches Server Side
                    Rendering, Static Site Generation und mehr erlaubt. Es ist
                    das Framework meiner Wahl für Webseiten, da es sehr flexibel
                    ist und gut mit den Technologien die Ich nutze
                    zusammenarbeitet.
                </div>
                <div>
                    Ein Beispiel Projekt ist diese Seite{" "}
                    <TLink name="Moeglich.dev" />
                </div>
            </div>
        ),
    },
    // {
    //     icon: () => <Icons.QwikIcon />,
    //     name: "Qwik",
    //     description: "todo",
    // },
    {
        icon: () => <Icons.PythonIcon />,
        name: "Python",
        description: () => (
            <div className="article">
                <div>
                    Python war die erste richtige Programmiersprache die Ich
                    gelernt habe, aber mittlerweile nutze Ich Python nur noch
                    für kleine Scripts.
                </div>
                <div>
                    Die meisten meiner Python Projekte habe Ich zu einer Zeit
                    geschrieben wo Ich noch nicht alle meine Projekte auf Github
                    gepostet habe, deshalb gibt es nur wenige Beispiele wie z.B.
                    <TLink name="list_screen" />
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.NodeJsIcon />,
        name: "Node",
        description: () => (
            <div className="article">
                <div>
                    Node nutze Ich hauptzächlich für Scripts in{" "}
                    <TLink name="Typescript" /> Projekten und wenn Ich Bots oder
                    komplexere Scripts schreibe.
                </div>
                <div>
                    Die meisten meiner <TLink name="Typescript" /> Projekte sind
                    jedoch nicht nur für Node, sondern auch für den Browser oder
                    andere Runtimes wie <TLink name="Vercel" /> Edge Functions.
                </div>
            </div>
        ),
    },
    // {
    //     icon: () => <Icons.PytorchIcon />,
    //     name: "Pytorch",
    //     description: "todo",
    // },
    {
        icon: () => <Icons.SvelteIcon />,
        name: "Sveltekit",
        description: () => (
            <div className="article">
                <div>
                    SvelteKit ist ein Metaframework für den Aufbau von
                    Webanwendungen. Es ist das erste Webframework, das ich
                    verwendet habe, es ist einfach und effizient.
                </div>
                <div>
                    Ich nutze SvelteKit in Projekten wie <TLink name="Tagaro" />{" "}
                    und <TLink name="ErcEsg" />, wo es mir ermöglicht, schnell
                    interaktive und performante Webseiten zu erstellen. Durch
                    die Kombination von SvelteKit mit anderen Technologien wie{" "}
                    <TLink name="Typescript" />, <TLink name="Tailwind" />, und{" "}
                    <TLink name="Postcss" /> kann Sveltekit eine relativ gute DX
                    bieten.
                </div>
                <div>
                    Sveltekit ist das was Ich für die meisten meiner aktiven
                    Projekte genutzt habe, aber mittlerweile bevorzuge Ich{" "}
                    <TLink name="Next" /> für neue Projekte, da es mehr Features
                    hat und besser mit den Technologien die Ich nutze
                    zusammenarbeitet.
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.TypescriptIcon />,
        name: "Typescript",
        description: () => {
            return (
                <div className="article">
                    <div>
                        Typescript ist die Sprache meiner Wahl für Web und viele
                        Scripts. Ich nutze fast nie Javascript ohne Typescript
                        dar es mir viele Vorteile gibt wie bessere DX durch
                        Types
                    </div>
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
                    <div>
                        Typescript ist eine der Zwei Sprachen welche Ich für
                        fast alle Projekte nutze, die andere ist{" "}
                        <TLink name="Rust" />
                    </div>
                </div>
            );
        },
    },
    {
        icon: () => <Icons.RustIcon />,
        name: "Rust",
        description: () => (
            <div className="article">
                <div>
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
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.ScssIcon />,
        name: "Scss",
        description: () => (
            <div className="article">
                <div>
                    Scss ist eine CSS Preprocessor die Ich in Projekten wie{" "}
                    <TLink name="Tagaro" /> nutze. Ich bevorzuge es gegenüber
                    CSS, aber <TLink name="Tailwind" /> ist in den meisten
                    Fällen besser.
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.PostcssIcon />,
        name: "Postcss",
        description: () => (
            <div className="article">
                <div>
                    Postcss ist nutze Ich selten direkt, aber es ist ein
                    wichtiger Teil von anderen CSS Tools wie{" "}
                    <TLink name="Tailwind" /> oder <TLink name="Scss" />
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.FirebaseIcon />,
        name: "Firebase",
        description: () => (
            <div className="article">
                <div>
                    Firebase ist ein Cloud Service von Google welcher viele
                    Services anbietet. Ich nutze aber nur die Datenbank um z.B.
                    in <TLink name="Tagaro" /> Kontaktformulare oder Logs zu
                    speichern.
                </div>
                <div>
                    Ich bevorzuge <TLink name="CockroachDb" /> +{" "}
                    <TLink name="Prisma" /> für die meisten Projekte, aber
                    Firebase hat den Vorteil der Echtzeit was es für Realtime
                    Logs oder Status Updates nützlich macht.
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.GoogleAnalyticsIcon />,
        name: "Google Analytics",
        description: () => (
            <div className="article">
                <div>
                    Google Analytics ist ein Tool um das Verhalten von Nutzern
                    auf einer Webseite zu analysieren. Ich nutze es aktuell nur
                    in <TLink name="Tagaro" />. Um möglicherweise verbesserungen
                    in der SEO zu finden oder zu sehen wie Nutzer die Seite
                    nutzen.
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.PrismaIcon />,
        name: "Prisma",
        description: () => (
            <div className="article">
                <div>
                    Prisma ist meine bevorzugte möglichkeit mit Datenbanken zu
                    interagieren. Ich nutze es meisten in Kombination mit{" "}
                    <TLink name="CockroachDb" /> habe es aber auch schon mit
                    anderen Datenbanken wie Postgres oder MySQL genutzt.
                </div>
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
        icon: () => <Icons.PusherIcon />,
        name: "Pusher",
        description: () => (
            <div className="article">
                <div>
                    Pusher ist ein Service um Echtzeit Daten zu senden. Es ist
                    das was Ich nutze wenn Ich <TLink name="CockroachDb" /> +{" "}
                    <TLink name="Prisma" /> nutze welche keine Echtzeit Updates
                    haben.
                </div>
                <div>
                    Ich nutze Pusher aktuell in 2 Projekten:
                    <ul>
                        <li>
                            <TLink name="Moeglich.dev" /> - Echtzeit Updates
                            aktuell nur auf einer Privaten Unterseite für
                            geteilte Counter
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
        icon: () => <Icons.CockroachDBIcon />,
        name: "CockroachDb",
        description: () => (
            <div className="article">
                <div>
                    CockroachDb ist eine verteilte SQL Datenbank. Ich nutze es
                    in fast allen Projekten welche eine Datenbank brauchen. Es
                    hat viele Vorteile wie Echtzeit Updates und Skalierbarkeit.
                </div>
                <div>
                    Einige Beispiele wo Ich CockroachDb nutze sind:
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
        icon: () => <Icons.DockerIcon />,
        name: "Docker",
        description: () => (
            <div className="article">
                <div>
                    Docker ist ein Tool um Anwendungen in Containern zu
                    verpacken. Ich nutze Docker für 2 Dinge: Builds und
                    Services. Aktuell nutze Ich es nicht für Deployments dar
                    hosting teuer ist.
                </div>
                <div>
                    Einige Beispiele wo Ich Docker nutze sind:
                    <ul>
                        <li>
                            <TLink name="Satworld" /> - Um Shopware lokal
                            isoliert zum testen zu hosten.
                        </li>
                    </ul>
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.NginxIcon />,
        name: "Nginx",
        description: () => (
            <div className="article">
                <div>
                    Ich nutze Nginx als Reverse Proxy für Services auf meinem
                    Server für viele Projekte. <br />
                    Das ermöglicht es mir mehrere Webseiten (in verschiedenen
                    Sprachen) auf einem Server zu hosten und https zu nutzen.
                </div>
                <div>
                    Einige Beispiele wo Ich Nginx nutze sind:
                    <ul>
                        <li>
                            <TLink name="Http-Websocket-Proxy" />
                        </li>
                        <li>
                            <TLink name="ErcEsg" />
                        </li>
                        <li>
                            <TLink name="Satworld" />
                        </li>
                    </ul>
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.GitIcon />,
        name: "Git",
        description: () => (
            <div className="article">
                <div>
                    Ich nutze Git für den größten Teil meiner Projekte. Es gibt
                    mir die Möglichkeit an Projekten von überall zu arbeiten und
                    diese zu versionieren.
                </div>
                <div>
                    Meistens nutze Ich Github (
                    <Link href="https://github.com/JeremyMoeglich">
                        Github - JeremyMoeglich
                    </Link>
                    ) als Hosting und <TLink name="Github Actions" /> für CI/CD
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.GithubActionsIcon />,
        name: "Github Actions",
        description: () => (
            <div className="article">
                <div>
                    Wenn Ich CI/CD brauche nutze Ich Github Actions. Es ist
                    kostenlos und dar Ich Github für fast alle meiner Projekte
                    nutze ist es einfach zu Integrieren.
                </div>
                <div>
                    Einige Beispiele wo Ich Github Actions nutze sind:
                    <ul>
                        <li>
                            <TLink name="Tagaro" /> - Deployments (
                            <TLink name="Strato" />)
                        </li>
                        <li>
                            <TLink name="functional_utilities" /> - Tests +{" "}
                            <TLink name="npm" /> Publish
                        </li>
                    </ul>
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.LinuxIcon />,
        name: "Linux",
        description: () => (
            <div className="article">
                <div>
                    Ich nutze Linux als Betriebssystem auf meinem Laptop,
                    Desktop und Servern. <br />
                    Für meine Systeme nutze Ich Arch Linux, da es mir zugriff zu
                    den neusten Paketen gibt, Linux allgemein ist oft besser für
                    Development dar Tools oft stabiler und besser sind. <br />
                    Auf Servern nutze Ich meistens Ubuntu, da es stabil ist und
                    trotzdem alles für Deployment hat.
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.VercelIcon />,
        name: "Vercel",
        description: () => (
            <div className="article">
                <div>
                    Vercel ist ein Hosting Service für Webseiten. Ich nutze es
                    für fast alle meiner Webseiten, da es einfach zu nutzen ist
                    und viele Features wie Edge Functions hat.
                </div>
                <div>
                    Einige Beispiele wo Ich Vercel nutze sind:
                    <ul>
                        <li>
                            <TLink name="Tagaro" />
                        </li>
                        <li>
                            <TLink name="Moeglich.dev" />
                        </li>
                        <li>
                            <TLink name="ErcEsg" />
                        </li>
                    </ul>
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.StratoIcon />,
        name: "Strato",
        description: () => (
            <div className="article">
                <div>
                    Strato ist ein CDN / Hosting Service. Der Grund warum Ich es
                    nutze ist das die alte Version von <TLink name="Tagaro" />{" "}
                    dort gehostet war und eine änderung zu Problemen geführt
                    hätte.
                </div>
                <div>
                    Das einzige Projekt wo Ich Strato nutze ist{" "}
                    <TLink name="Tagaro" />
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.TurborepoIcon />,
        name: "Turborepo",
        description: () => (
            <div className="article">
                <div>
                    Turborepo ist ein Tool für Monorepos. Ich nutze es in meinen
                    größeren Projekten wie <TLink name="Tagaro" /> und{" "}
                    <TLink name="Japtools" /> um einfach Packages zwischen
                    Teilen des Projekts zu teilen.
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.TrpcIcon />,
        name: "TRPC",
        description: () => (
            <div className="article">
                <div>
                    TRPC ist meine bevorzugte Möglichkeit um mit dem Backend
                    Service zu kommunizieren. Es ermöglicht Type-Safety in der
                    API was ohne RPC nicht möglich wäre. TRPC ist die einfachste
                    möglichkeit RPC im Frontend zu nutzen.
                </div>
                <div>
                    Einige Beispiele wo Ich TRPC nutze sind:
                    <ul>
                        <li>
                            <TLink name="Moeglich.dev" /> - Aktuell nur für eine
                            Private Unterseite, aber das Kontaktformular wird
                            bald auch TRPC nutzen
                        </li>
                        <li>
                            Ein Projekt welches noch nicht veröffentlicht ist,
                            es ist ein Online Multiplayer Spiel jegliche
                            Frontend{" "}
                            <span className="inline-block translate-y-[3px]">
                                <CgArrowRight />
                            </span>{" "}
                            Backend Kommunikation läuft über TRPC
                        </li>
                    </ul>
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.NpmIcon />,
        name: "npm",
        description: () => (
            <div className="article">
                <div>
                    Alle meine Projekte welche in Typescript geschrieben sind
                    nutzen npm Packages. <br />
                    Aber den npm Package Manager nutze Ich eher selten direkt,
                    da Ich meistens <TLink name="Bun" /> oder{" "}
                    <TLink name="Pnpm" /> nutze.
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.BunIcon />,
        name: "Bun",
        description: () => (
            <div className="article">
                <div>
                    Bun ist ein Package Manager welcher schneller ist als npm
                    und pnpm. Ich nutze es in Projekten wo Ich npm oder pnpm
                    nutzen würde.
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.PnpmIcon />,
        name: "Pnpm",
        description: () => (
            <div className="article">
                <div>
                    Pnpm ist ein Package Manager welcher schneller ist als npm
                    und npm. Ich nutze es in Projekten wo Ich npm oder bun
                    nutzen würde.
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.BiomeIcon />,
        name: "Biome",
        description: () => (
            <div className="article">
                <div>
                    Biome ist ein ersatzt für andere Tools wie Prettier und
                    ESLint, es ist in <TLink name="Rust" /> geschrieben und ist
                    schneller und ist somit schneller. <br />
                    Der Hauptgrund warum Ich es nutze ist jedoch das es mehr
                    Funktionen hat und besser sich in Projekte integriert.
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.WebassemblyIcon />,
        name: "Webassembly",
        description: () => <div className="article">
            <div>
                Webassembly ist eine
            </div>
        </div>,
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

const TLinkNameContext = createContext<{
    addName?: (name: string) => void;
    removeName?: (name: string) => void;
}>({});

// Component to collect TLink names, making context usage optional
export const TLinkNameCollector: React.FC<
    PropsWithChildren<{
        onNameChange: (names: string[]) => unknown;
    }>
> = ({ children, onNameChange }) => {
    const [names, setNames] = useState<string[]>([]);

    const addName = (name: string) =>
        setNames((prev) => {
            const v = [...prev, name];
            onNameChange(v);
            return v;
        });
    const removeName = (name: string) =>
        setNames((prev) => {
            const v = prev.filter((n) => n !== name);
            onNameChange(v);
            return v;
        });

    return (
        <TLinkNameContext.Provider value={{ addName, removeName }}>
            {children}
        </TLinkNameContext.Provider>
    );
};

// TLink component modified to optionally use the context
export const TLink: React.FC<{ name: keyof typeof link_map }> = ({ name }) => {
    const { addName, removeName } = useContext(TLinkNameContext);

    // biome-ignore lint/correctness/useExhaustiveDependencies: addName and removeName are mutated within the effect causing a loop if their a dependency
    useEffect(() => {
        addName?.(name);
        return () => removeName?.(name);
    }, [name]);

    return (
        <Link href={`/overview/${link_map[name].kind}/${name}`}>{name}</Link>
    );
};

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
