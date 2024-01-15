import type { Page } from "puppeteer";

export const projects = [
    {
        name: "Tagaro",
        description: "todo",
        icon: "images/projects/tagaro_icon.png",
        site_image: "images/projects/tagaro_site.png",
        site_url: "https://tagaro.de",
        site_load_action: async (site: Page) => {
            const el = await site.waitForSelector("p.blue::-p-text(Alle Akzeptieren)");
            if (!el) throw new Error("Could not find accept button");
            await el.click();
        },
        github_url: "https://github.com/JeremyMoeglich/Tagaro-Monorepo"
    },
    {
        name: "Moeglich.dev",
        description: "todo",
        icon: "images/projects/moeglichdev_icon.png",
        site_image: "images/projects/moeglichdev_site.png",
        site_url: "https://moeglich.dev",
        github_url: "https://github.com/JeremyMoeglich/Moeglich-Dev-Web"
    },
    {
        name: "ErcEsg",
        description: "todo",
        icon: "images/projects/ercesg_icon.png",
        site_image: "images/projects/ercesg_site.png",
        site_url: "https://erc-heessen.de",
        github_url: "https://github.com/JeremyMoeglich/erc-esg"
    },
    {
        name: "Japtools",
        description: "todo",
        icon: "images/projects/japtools_icon.png",
        site_image: "images/projects/japtools_site.png",
        site_url: "https://japtools.moeglich.dev",
        github_url: "https://github.com/JeremyMoeglich/japtools"
    },
    {
        name: "functional_utilities",
        description: "todo",
        icon: "images/projects/functional_utilities_icon.png",
        package_url: "https://www.npmjs.com/package/functional-utilities",
        github_url: "https://github.com/JeremyMoeglich/functional_utilities"
    },
    {
        name: "Quip",
        description: "todo",
        icon: "images/projects/quip_icon.png",
        github_url: "https://github.com/JeremyMoeglich/quip"
    },
    {
        name: "list_screen",
        description: "todo",
        icon: "images/projects/list_screen_icon.png",
        package_url: "https://pypi.org/project/list-screen/",
    },
    {
        name: "tsgridlib",
        description: "todo",
        icon: "images/projects/tsgridlib_icon.png",
        package_url: "https://www.npmjs.com/package/tsgridlib",
    },
    {
        name: "Satworld/Atelmo",
        description: "todo",
        icon: "images/projects/satworld_icon.png",
        site_image: "images/projects/satworld_site.png",
        site_url: "http://newshopware.satworldit.de/",
    },
    {
        
    }
] as const;