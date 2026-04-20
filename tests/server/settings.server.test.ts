import { describe, test, expect } from "bun:test";
import { parseHTML } from "linkedom";
import Server from "src/endpoints/admin-ui/settings/settings.server";
import type { Cms } from "src/Cms";
import type { TPage, TSystem, TTemplate } from "src/contracts/Repository/TModels";

/**
 * The Settings admin page builds <option> elements by concatenating DB-sourced
 * strings into innerHTML (page titles, template categories, the saved language
 * tag). A page titled `<script>alert(1)</script>` must NOT reach the rendered
 * HTML as an executable payload — an authenticated attacker-admin would
 * otherwise XSS a co-admin the moment they open Settings.
 *
 * We check the real security property rather than surface string matching:
 *  • no injected <script>/<img>/<svg> element appears in the parsed output
 *  • double-quotes inside user data are encoded as &quot; so the value="…"
 *    attribute cannot be broken out of
 *  • the option *label* displays the payload as literal text (&lt;…)
 */

type MockOpts = {
    pages?: TPage[];
    templates?: TTemplate[];
    system?: { site?: Partial<TSystem["site"]>; editor?: Partial<TSystem["editor"]> };
};

function mockSystem(opts: MockOpts = {}): Cms {
    const system: TSystem = {
        initializationStep: 0,
        site: {
            name: "",
            favicon: "",
            visible: true,
            host: "",
            language: "",
            theme: "",
            notFound: null,
            serverError: null,
            ...opts.system?.site,
        },
        editor: { layoutCategory: "", ...opts.system?.editor },
    };

    return {
        repository: {
            getSystem: async () => system,
            getAllPages: async () => opts.pages ?? [],
            getAllTemplates: async () => opts.templates ?? [],
        },
        config: { adminPathPrefix: "/cms", clientPathPrefix: "/" },
    } as unknown as Cms;
}

const page = (over: Partial<TPage> = {}): TPage => ({
    path: "/article",
    identifier: "",
    content: "",
    title: "Article",
    description: "",
    visible: true,
    tags: [],
    ...over,
});

const tpl = (over: Partial<TTemplate> = {}): TTemplate => ({
    name: "Tpl",
    description: "",
    content: "",
    category: "hero",
    createdAt: new Date(),
    ...over,
});

async function render(opts: MockOpts = {}): Promise<string> {
    const req = new Request("http://localhost/cms/admin/settings");
    const res = await Server(req, mockSystem(opts));
    return res.text();
}

/** Baseline script count (the static <script src="script.js"> and
 *  <script src="settings.js"> in the template). Any extra <script> means
 *  a payload made it through. */
const BASELINE_SCRIPT_COUNT = 2;

describe("settings.server — XSS prevention in <option> rendering", () => {

    test("page title with a <script> payload injects no extra script element", async () => {
        const html = await render({
            pages: [page({ title: "<script>alert(1)</script>", path: "/p" })],
        });
        const doc = parseHTML(html).document;
        expect(doc.querySelectorAll("script")).toHaveLength(BASELINE_SCRIPT_COUNT);
        // The label of the option shows the payload as literal text.
        expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    });

    test("page identifier with a double-quote cannot break out of the value attribute", async () => {
        const html = await render({
            pages: [page({ path: "/p", identifier: 'a"><img onerror=alert(1) src=x>' })],
        });
        // The double-quote MUST be entity-encoded to preserve attribute bounds.
        expect(html).toContain("&quot;");
        // And no <img onerror=…> element was injected.
        const doc = parseHTML(html).document;
        expect(doc.querySelectorAll("img[onerror]")).toHaveLength(0);
    });

    test("template category with an <img> payload injects no image element", async () => {
        const html = await render({
            templates: [tpl({ category: "<img src=x onerror=alert(1)>" })],
        });
        const doc = parseHTML(html).document;
        expect(doc.querySelectorAll("img[onerror]")).toHaveLength(0);
        // Label renders the literal text.
        expect(html).toContain("&lt;img");
    });

    test("stale layout-category (no longer in templates) does not inject a <svg>", async () => {
        const html = await render({
            templates: [],
            system: { editor: { layoutCategory: "<svg onload=alert(1)>" } },
        });
        const doc = parseHTML(html).document;
        // Baseline template contains static <svg> icons; the injected one has
        // an onload attr, which the static ones don't.
        expect(doc.querySelectorAll("svg[onload]")).toHaveLength(0);
        expect(html).toContain("(missing)");
    });

    test("custom language tag with a payload injects no extra script element", async () => {
        const html = await render({
            system: { site: { language: "fr-FR\"><script>alert(1)</script>" } },
        });
        const doc = parseHTML(html).document;
        expect(doc.querySelectorAll("script")).toHaveLength(BASELINE_SCRIPT_COUNT);
        expect(html).toContain("&quot;");
        expect(html).toContain("(custom)");
    });

    test("ordinary values still render correctly (no over-escape regression)", async () => {
        const html = await render({
            pages: [page({ title: "About us", path: "/about" })],
            templates: [tpl({ category: "hero" })],
        });
        expect(html).toContain("About us");
        expect(html).toContain(">hero<");
    });
});
