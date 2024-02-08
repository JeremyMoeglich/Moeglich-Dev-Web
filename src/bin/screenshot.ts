import puppeteer, { type Page, type Browser } from "puppeteer";
import { packageDirectory } from "pkg-dir";
import { readFile } from "fs/promises";
import { projects } from "~/data/tlink";

const projectRoot = await packageDirectory();
if (!projectRoot) throw new Error("Could not find project root");
process.chdir(projectRoot);

const pkg_json: unknown = JSON.parse(await readFile("package.json", "utf-8"));
if (typeof pkg_json !== "object" || pkg_json === null)
    throw new Error("package.json is not an object");
if (!("name" in pkg_json)) throw new Error("package.json does not have a name");
if (pkg_json.name !== "moeglichdev")
    throw new Error("package.json has wrong name");

async function takeScreenshot(
    browser: Browser,
    url: string,
    path: string,
    load_action?: (site: Page) => Promise<void>,
) {
    console.log(`Taking screenshot of ${url} to ${path}`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, {
        timeout: 25000
    });
    if (load_action) await load_action(page);
    await page.waitForNetworkIdle();
    await page.screenshot({ path: path });
    await page.close();
}

const browser = await puppeteer.launch({
    headless: "new",
    
});

for (const data of projects) {
    if (!("site_url" in data)) continue;
    if (!("image" in data)) continue;

    const load_action =
        "site_load_action" in data ? data.site_load_action : undefined;

    await takeScreenshot(
        browser,
        data.site_url,
        `public/${data.image}`,
        load_action,
    );
}

await browser.close();
