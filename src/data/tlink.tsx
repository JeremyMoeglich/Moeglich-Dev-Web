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
import * as Icons from "~/app/_components/icons";
import { dedent } from "~/utils/dedent";
import { CopyBlock, noctisViola, nord } from "react-code-blocks";

export const projects = [
    {
        name: "Tagaro",
        summary: "Onlineshop für Sky",
        description: {
            de: () => (
                <div className="article">
                    <div>
                        Tagaro ist ein Onlineshop für Sky, bei dem ich seit
                        mehreren Jahren für die Website, die Automatisierung von
                        Bestellungen und sämtliche IT-Aufgaben zuständig bin.
                    </div>
                    <div>
                        Das Tagaro-Projekt ist ein Monorepo, das{" "}
                        <TLink name="Turborepo" /> und <TLink name="pnpm" />{" "}
                        verwendet und folgende Teilprojekte enthält:
                        <ul>
                            <li>
                                Eine Website, entwickelt mit{" "}
                                <TLink name="Sveltekit" /> als Metaframework und
                                Typescript als Sprache. <br />
                                Weitere Technologien:
                                <ul>
                                    <li>
                                        <TLink name="Turborepo" />: Monorepo
                                    </li>
                                    <li>
                                        <TLink name="pnpm" />: Package Manager +
                                        Workspaces
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
                                        <TLink name="Google Analytics" />:
                                        Allgemeine Website Analytics
                                    </li>
                                    <li>
                                        <TLink name="Github Actions" />: CI/CD,
                                        Deployments
                                    </li>
                                </ul>
                            </li>
                            <li>
                                Ein Admin-Panel, ebenfalls entwickelt mit{" "}
                                <TLink name="Sveltekit" /> und{" "}
                                <TLink name="Typescript" />, umfasst Tools wie
                                einen E-Mail-Generator, Log-Einsichten und einen
                                Paketbild-Generator. <br />
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
                        moeglich.dev ist meine persönliche Website und dient als
                        mein Portfolio. Sie ist mit <TLink name="Next" /> und{" "}
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
                        Schule). Ich leitete dort den IT-Bereich und erstellte
                        unter anderem die Website. <br />
                        Die Website, erstellt nach dem <TLink name="Tagaro" />
                        -Projekt, basiert auf einem ähnlichen Technologiestack:{" "}
                        <TLink name="Sveltekit" /> und{" "}
                        <TLink name="Typescript" />. <br />
                        Das Projekt ist kleiner, aber dynamischer, da es ein
                        Artikel und Account System enthält.
                    </div>
                    <div>
                        Das Artikelsystem ist maßgeschneidert; das Frontend
                        interagiert mit einer REST-API, die mittels{" "}
                        <TLink name="Prisma" /> auf die{" "}
                        <TLink name="CockroachDb" />
                        -Datenbank zugreift.
                    </div>
                    <div>
                        Die Seite und API werden mit <TLink name="Vercel" />{" "}
                        Edge Functions gehostet.
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
        summary: "Eine Sprachlern-Webseite",
        description: {
            de: () => (
                <div className="article">
                    <div>
                        Japtools ist eine persönliche interaktive
                        Sprachlernwebsite, die mit <TLink name="Sveltekit" />{" "}
                        und <TLink name="Typescript" /> entwickelt wurde.
                    </div>
                    <div>
                        Besonders hervorzuheben ist die sehr interaktive
                        Gestaltung der Seite, die unter anderem auf einem
                        serverseitigen SRS (Spaced-Repetition-System) basiert.
                        <br />
                        Dieses System ist implementiert mit den folgenden
                        weiteren Technologien:
                        <ul>
                            <li>
                                <TLink name="CockroachDb" />: Speichern von
                                Nutzerdaten wie z.B. Lernstatus
                            </li>
                            <li>
                                <TLink name="Prisma" />: Typesafe ORM zum
                                Zugriff der Datenbank
                            </li>
                            <li>
                                <TLink name="pnpm" />: Package Manager
                            </li>
                            <li>
                                <TLink name="Vercel" />: Hosting der Website
                            </li>
                            <li>
                                <TLink name="Tailwind" />: Styling
                            </li>
                        </ul>
                    </div>
                </div>
            ),
        },
        icon: "images/projects/japtools_icon.png",
        image: "/images/projects/japtools_site.png",
        site_url: "https://japtools.moeglich.dev",
        github_url: "https://github.com/JeremyMoeglich/japtools",
        tags: ["Japtools", "Sveltekit", "Typescript", "Vercel"],
    },
    {
        name: "functional_utilities",
        summary: "Ein Utility-NPM-Package",
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
                    Das Package ist in <TLink name="Typescript" /> geschrieben
                    und enthält Funktionen fürs Arbeiten mit Arrays, Objekten,
                    Strings und mehr. Einige Ziele sind Gute Type Inference und
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
                <div>
                    Intern enthält die Library ein Compiler der Javascript
                    Methoden in einem Object Trackt und daraus dann einen Shader
                    und eine Funktion (bindings) mit automatischen Types
                    returned
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
            <div className="article">
                <div>
                    Quip hat das Ziel die erste Universelle Programmiersprache
                    zu sein.
                </div>
                <div>
                    Dieses Ziel wird erreicht indem Quip keine Annahmen macht
                    und Libraries soviel kontrolle wie möglich gibt, z.B. ist
                    der Syntax erweiterbar und Compile-Time-Execution ist eines
                    der Wichtigsten features
                </div>
                <div>
                    Die Sprache ist noch nicht nutzbar und in Planung +
                    Entwicklung
                </div>
                <div>
                    Hier ist eine Übersicht von Features welche schon geplant
                    sind
                    <ul>
                        <li>
                            <b>Automatic Compile Time Memory Management</b>{" "}
                            <br />
                            Es gibt 3 Hauptverfahren wie existierende Sprachen
                            Memory Managen:
                            <ul>
                                <li>
                                    Garbage Collector - Langsamer, aber Sicher,
                                    Einfach und Automatisch (z.B. Python, Java,
                                    Javascript, Go)
                                </li>
                                <li>Manual Memory Management</li> - Schnell,
                                aber unsicher und schwer (z.B. C, C++, Zig)
                                <li>Ownership & Borrowing</li> - Schnell und
                                Sicher, aber limitierend und schwer zu lernen
                                (Rust, C++ unique pointers)
                            </ul>
                            Alle diese verfahren haben Probleme, Quip nutzt ein
                            anderes Verfahren wo der Compiler via Static
                            Analysis herausfindet wie Werte genutzt werden und
                            aus vielen Verschiedenen Strategien die beste
                            auswählt
                        </li>
                        <li>
                            <b>Async/Sync Identity</b> <br />
                            In Quip kann jede Async function auch Sync genutzt
                            werden, z.B.:
                            <CopyBlock
                                text={dedent`
                                    async fn test() -> _ {
                                        return 1
                                    }
                                
                                    fn main1() {
                                        let a = test() // async wird sync genutzt
                                    }
                                
                                    async fn main2() {
                                        let a_future = test.async()
                                        let a = a_future.await
                                    
                                        // oder 1 Zeile
                                        let a = test.async().await
                                    }
                                `}
                                language="rust"
                                showLineNumbers
                                wrapLongLines
                                theme={noctisViola}
                            />
                        </li>
                        <li>
                            <b>Auto-Locking</b> <br />
                            In Quip gibt es wie in Rust die möglichkeit manuell
                            Locking via Mutex, RwLock und mehr zu machen, aber
                            sonst macht Quip das automatisch, z.B.:
                            <CopyBlock
                                text={dedent`
                                let a = 1
                                        
                                os.thread.spawn(|| {
                                    a += 2
                                })

                                println(a)
                                `}
                                language="rust"
                                showLineNumbers
                                wrapLongLines
                                theme={noctisViola}
                            />
                            In Rust würde das ein Error sein, in C++ würde das
                            zu undefiniertem Verhalten führen (data-race), in
                            Quip wird automatisch ein Atomic genutzt
                        </li>
                    </ul>
                </div>
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
                    Ein <TLink name="Python" /> Package mit dem Ziel multi-line
                    Texte im Terminal einfach darzustellen. Es funktioniert
                    indem man eine Liste von Strings der Library gibt, diese
                    wird dann automatisch den Aktuellen Inhalt des Terminals
                    anpassen.
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
                    Ein <TLink name="npm" /> Package welches die Darstellung und
                    Manipulation von Grids in <TLink name="Typescript" />{" "}
                    vereinfacht. Ich nutze es in nur wenigen Projekten aber es
                    ist sehr nützlich wenn es gebraucht wird.
                </div>
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
                    Bei SatWorld und Atelmo, Anbietern im Satellitenbereich, war
                    ich Teil eines kleines Teams, das zu einem neuen Shopsystem
                    migriert ist. Dabei habe ich ein Migrationssystem in{" "}
                    <TLink name="Rust" /> geschrieben und vieles mehr wie z.B.
                    automatische Backups.
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
                    Webhooks zu empfangen auch wenn der Server nicht öffentlich
                    erreichbar ist (z.B. localhost) oder die IP dynamisch ist.
                </div>
                <div>
                    Einige Beispiele wo ich es nutze sind:
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
                    Aktuell ist die Library in purem Typescript geschrieben,
                    aber Beschleunigung mit <TLink name="tgpu" /> und{" "}
                    <TLink name="Webassembly" /> via <TLink name="Rust" /> ist
                    in der Zukunft geplant. <br />
                    Derzeit ist sie Teil von Moeglich.dev, allerdings plane ich,
                    sie irgendwann auf <TLink name="npm" /> zu veröffentlichen.
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
                    aktuell Privat, aber ein Beispiel ist diese Seite{" "}
                    <TLink name="Moeglich.dev" />
                </div>
                <div>
                    Der Grund warum ich React nutze ist das es sehr flexibel ist
                    im vergleich zu anderen Frameworks wie{" "}
                    <TLink name="Sveltekit" />
                </div>
                <div>
                    Allgemein nutze ich React mit <TLink name="Typescript" />,{" "}
                    <TLink name="Tailwind" /> und <TLink name="Next" /> da es
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
                    Tailwind macht Styling einfacher, besonders wenn das CSS
                    kein Scoping hat (wie in <TLink name="React" />/
                    <TLink name="Next" />
                    ). <br />
                    Deshalb nutze ich es in allen meiner <TLink name="Next" />{" "}
                    Projekte.
                </div>
                <div>
                    Es gibt auch Projekte, in denen ich es nicht nutze; diese
                    sind hauptsächlich mit <TLink name="Sveltekit" />{" "}
                    entwickelt, da Sveltekit CSS auf die einzelnen Dateien
                    isoliert ist. Aber auch bei diesen Projekten wechsle ich
                    langsam zu Tailwind, wie zum Beispiel bei{" "}
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
                    ist und gut mit den Technologien die ich nutze
                    zusammenarbeitet.
                </div>
                <div>
                    Ein Beispiel Projekt ist diese Seite{" "}
                    <TLink name="Moeglich.dev" />
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.PythonIcon />,
        name: "Python",
        description: () => (
            <div className="article">
                <div>
                    Python war die erste richtige Programmiersprache die ich
                    gelernt habe, aber mittlerweile nutze ich Python nur noch
                    für kleine Scripts.
                </div>
                <div>
                    Die meisten meiner Python Projekte habe ich zu einer Zeit
                    geschrieben wo ich noch nicht alle meine Projekte auf Github
                    gepostet habe, deshalb gibt es nur wenige Beispiele wie z.B.{" "}
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
                    Node nutze ich hauptzächlich für Scripts in{" "}
                    <TLink name="Typescript" /> Projekten und wenn ich Bots oder
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
                    ich nutze SvelteKit in Projekten wie <TLink name="Tagaro" />{" "}
                    und <TLink name="ErcEsg" />, wo es mir ermöglicht, schnell
                    interaktive und performante Webseiten zu erstellen. Durch
                    die Kombination von SvelteKit mit anderen Technologien wie{" "}
                    <TLink name="Typescript" />, <TLink name="Tailwind" />, und{" "}
                    <TLink name="Postcss" /> kann Sveltekit eine relativ gute DX
                    bieten.
                </div>
                <div>
                    Sveltekit ist das was ich für die meisten meiner aktiven
                    Projekte genutzt habe, aber mittlerweile bevorzuge ich{" "}
                    <TLink name="Next" /> für neue Projekte, da es mehr Features
                    hat und besser mit den Technologien die ich nutze
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
                        da es viele Vorteile bietet, wie zum Beispiel eine
                        bessere Entwicklererfahrung (DX) durch Types.
                    </div>
                    <div>
                        Einige Beispiele wo ich Typescript nutze sind:
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
                        Typescript ist eine der 2 Sprachen welche ich für fast
                        alle Projekte nutze, die andere ist{" "}
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
                            Version der Sprache genutzt (Quip-Proto) zum
                            Bootstrapping
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
                    Wie <TLink name="Next" /> nutze ich Rust immer mehr und die
                    meisten Projekte wo ich Rust nutze sind noch nicht fertig /
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
                    Scss ist eine CSS Preprocessor die ich in Projekten wie{" "}
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
                    Postcss ist nutze ich selten direkt, aber es ist ein
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
                    Firebase ist ein Cloud-Service von Google, der viele Dienste
                    anbietet. Ich nutze jedoch nur die Datenbank, um z.B.
                    Kontaktformulare oder Logs in <TLink name="Tagaro" /> zu
                    speichern.
                </div>
                <div>
                    Ich bevorzuge <TLink name="CockroachDb" /> +{" "}
                    <TLink name="Prisma" /> für die meisten Projekte, aber
                    Firebase bietet den Vorteil der Echtzeitverarbeitung, was es
                    für Echtzeit-Logs oder Statusaktualisierungen nützlich
                    macht.
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
                    Google Analytics ist ein Tool, um das Verhalten von Nutzern
                    auf einer Webseite zu analysieren. Ich nutze es aktuell nur
                    auf <TLink name="Tagaro" />, um mögliche Verbesserungen in
                    der SEO zu identifizieren oder zu analysieren, wie Nutzer
                    die Seite nutzen
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
                    Prisma ist meine bevorzugte Möglichkeit, mit Datenbanken zu
                    interagieren. Ich nutze es meistens in Kombination mit{" "}
                    <TLink name="CockroachDb" />, habe es aber auch schon mit
                    anderen Datenbanken wie Postgres oder MySQL genutzt.
                </div>
                <div>
                    Einige Beispiele wo ich Prisma nutze sind:
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
                    Pusher ist ein Service, um Echtzeit-Events zu senden. Ich
                    nutze es, wenn ich <TLink name="CockroachDb" /> +{" "}
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
                    CockroachDB ist eine verteilte SQL-Datenbank. Ich nutze
                    diese in fast allen Projekten die eine Datenbank brauchen.
                    Es hat viele Vorteile wie Echtzeit Updates und
                    Skalierbarkeit.
                </div>
                <div>
                    Einige Beispiele wo ich CockroachDb nutze sind:
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
                    Docker ist ein Tool, um Anwendungen in Containern zu
                    verpacken. Ich nutze Docker für 2 Dinge: Builds und
                    Services. Aktuell nutze ich es nicht für Deployments, da das
                    Hosting teuer ist.
                </div>
                <div>
                    Einige Beispiele wo ich Docker nutze sind:
                    <ul>
                        <li>
                            <TLink name="Satworld" /> - Um Shopware lokal
                            isoliert zum testen zu hosten.
                        </li>
                        <li>
                            Rust Builds welche eine alte glibc Version benötigen
                            für portability, z.B. für{" "}
                            <TLink name="Http-Websocket-Proxy" />
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
                    Server in vielen Projekten. <br />
                    Dies ermöglicht es mir, mehrere Webseiten (in verschiedenen
                    Sprachen) auf einem Server zu hosten und HTTPS zu nutzen.
                </div>
                <div>
                    Einige Beispiele wo ich Nginx nutze sind:
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
                    Ich nutze Git für die meisten meiner Projekte. Es gibt mir
                    die Möglichkeit, an Projekten von überall zu arbeiten und
                    verschiedene Versionen zu verwalten.
                </div>
                <div>
                    Meistens nutze ich Github (
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
                    Wenn ich CI/CD brauche, nutze ich GitHub Actions. Es ist
                    kostenlos, und da ich GitHub für fast alle meiner Projekte
                    nutze, ist es einfach zu integrieren.
                </div>
                <div>
                    Einige Beispiele wo ich Github Actions nutze sind:
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
                    Für meine Systeme nutze ich Arch Linux, da es mir Zugriff
                    auf die neuesten Pakete bietet. Linux ist generell oft
                    besser für Development, da die Tools stabiler und
                    ausgereifter sind. <br />
                    Auf Servern nutze ich meistens Ubuntu, da es stabil ist und
                    dennoch alles Nötige für Deployments bietet.
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
                    Vercel ist ein Hosting-Dienst für Webseiten. Ich nutze es
                    für fast alle meine Webseiten, da es einfach zu nutzen ist,
                    kostenlos für kleine Projekte ist und viele Features mit
                    guter Performance bietet.
                </div>
                <div>
                    Einige Beispiele wo ich Vercel nutze sind:
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
                    Strato ist ein CDN- und Hosting-Dienst. Ich nutze es, weil
                    die alte Version von <TLink name="Tagaro" /> dort gehostet
                    wurde und eine Änderung zu Problemen geführt hätte.
                </div>
                <div>
                    Das einzige Projekt wo ich Strato nutze ist{" "}
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
                    Turborepo ist ein Tool für Monorepos, das ich in meinen
                    größeren Projekten wie <TLink name="Tagaro" /> und{" "}
                    <TLink name="Japtools" /> nutze, um einfach Packages
                    zwischen Teilen des Projekts zu teilen.
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
                    TRPC ist meine bevorzugte Methode, um mit dem
                    Backend-Service zu kommunizieren. Es ermöglicht Type-Safety
                    in der API, was ohne RPC nicht möglich wäre.
                </div>
                <div>
                    Einige Beispiele wo ich TRPC nutze sind:
                    <ul>
                        <li>
                            <TLink name="Moeglich.dev" /> - Aktuell nur für eine
                            Private Unterseite, aber das Kontaktformular wird
                            bald auch TRPC nutzen
                        </li>
                        <li>
                            Ein noch nicht veröffentlichtes Projekt ist ein
                            Online-Multiplayer-Spiel, bei dem jegliche
                            Kommunikation von Frontend zu Backend über TRPC
                            läuft, <TLink name="Pusher" /> wird oft für Backend
                            zu Frontend genutzt
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
                    Alle meine Projekte, die in TypeScript geschrieben sind,
                    nutzen npm-Packages. <br />
                    Den npm-Package-Manager nutze ich jedoch eher selten direkt,
                    da ich meistens <TLink name="Bun" /> oder{" "}
                    <TLink name="pnpm" /> bevorzuge.
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
                    Bun ist eine Alternative zu Node, die oft schneller als Node
                    ist. <br />
                    Die Runtime ist etwas schneller, und ich nutze sie eher
                    selten, da die Vorteile gering sind. Jedoch ist der
                    Bun-Package-Manager deutlich schneller als npm und pnpm,
                    weshalb ich ihn in Projekten wie{" "}
                    <TLink name="Moeglich.dev" /> welche nicht Workspaces
                    benötigen.
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.PnpmIcon />,
        name: "pnpm",
        description: () => (
            <div className="article">
                <div>
                    pnpm ist ein Package Manager, der schneller ist als npm und
                    Yarn (jedoch langsamer als <TLink name="Bun" />
                    ). <br />
                    Ich nutze allgemein selten npm und nie Yarn; pnpm ist mein
                    bevorzugter Package Manager, z.B. in Projekten wie{" "}
                    <TLink name="functional_utilities" />,{" "}
                    <TLink name="Tagaro" />, <TLink name="ErcEsg" /> und{" "}
                    <TLink name="Japtools" />. Für neuere Projekte wie{" "}
                    <TLink name="Moeglich.dev" /> nutze ich jedoch{" "}
                    <TLink name="Bun" /> da es noch schneller ist, es
                    unterstützt jedoch noch nicht Workspaces welche ich z.B. bei{" "}
                    <TLink name="Tagaro" /> und <TLink name="Japtools" />{" "}
                    brauche.
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
                    Biome ist ein Ersatz für andere Tools wie Prettier und
                    ESLint, geschrieben in <TLink name="Rust" />, und zeichnet
                    sich durch höhere Geschwindigkeit aus. <br />
                    Der Hauptgrund für die Nutzung ist jedoch, dass es mehr
                    Funktionen bietet, weniger Bugs hat und sich besser in
                    Projekte integriert.
                </div>
            </div>
        ),
    },
    {
        icon: () => <Icons.WebassemblyIcon />,
        name: "Webassembly",
        description: () => (
            <div className="article">
                <div>
                    Webassembly ermöglicht es, Code, der nicht in JavaScript
                    geschrieben ist, im Browser zu nutzen. Ich verwende es
                    hauptsächlich, um Rust-Code im Browser einzusetzen und die
                    Performance zu verbessern. Ein Beispielprojekt, an dem ich
                    mit Webassembly arbeite, ist <TLink name="tshapes" />
                </div>
            </div>
        ),
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
        <Link
            href={`/overview/${link_map[name].kind}/${name.replaceAll(
                " ",
                "_",
            )}`}
        >
            {name}
        </Link>
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
