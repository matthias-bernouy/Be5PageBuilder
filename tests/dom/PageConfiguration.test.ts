import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { PageConfiguration } from "src/core/Editor/components/PageConfiguration/PageConfiguration";

/**
 * Installs `element` and returns the chars needed to drive the form.
 * happy-dom doesn't fire the `w13c-input`'s synthetic `input` event when we
 * set `.value` programmatically — we dispatch it manually.
 */
function mountPageConfiguration(attrs: Record<string, string> = {}): PageConfiguration {
    document.body.innerHTML = "";
    const el = document.createElement("w13c-page-information") as PageConfiguration;
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    return el;
}

function setInputValue(el: PageConfiguration, name: string, value: string) {
    const input = el.shadowRoot?.querySelector(`[name=${name}]`) as any;
    if (!input) throw new Error(`No field named "${name}"`);
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

function blurInput(el: PageConfiguration, name: string) {
    const input = el.shadowRoot?.querySelector(`[name=${name}]`) as any;
    input?.dispatchEvent(new Event("blur", { bubbles: true }));
}

function getCounter(el: PageConfiguration, fieldName: string): HTMLElement {
    return el.shadowRoot!.querySelector(`.counter[data-for="${fieldName}"]`) as HTMLElement;
}

function getHint(el: PageConfiguration): HTMLElement {
    return el.shadowRoot!.getElementById("path-hint") as HTMLElement;
}

function getSaveBtn(el: PageConfiguration): HTMLElement {
    return el.shadowRoot!.getElementById("save-btn") as HTMLElement;
}

function getPreview(el: PageConfiguration): HTMLElement {
    return el.shadowRoot!.getElementById("url-preview") as HTMLElement;
}

function getPreviewRow(el: PageConfiguration): HTMLElement {
    return el.shadowRoot!.getElementById("url-row") as HTMLElement;
}

function getOpenBtn(el: PageConfiguration): HTMLButtonElement {
    return el.shadowRoot!.getElementById("url-open") as HTMLButtonElement;
}

// Minimal stub so the submit handler doesn't explode when we drive it.
function stubEditorManager() {
    (document as any).EditorManager = {
        ...(document as any).EditorManager,
        save: async () => {},
    };
}

describe("PageConfiguration", () => {

    const originalFetch = globalThis.fetch;

    beforeEach(() => {
        stubEditorManager();
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    // --- Structure ---

    test("registers itself as <w13c-page-information>", () => {
        expect(customElements.get("w13c-page-information")).toBe(
            PageConfiguration as unknown as CustomElementConstructor,
        );
    });

    test("puts the Identifier field inside an Advanced section, collapsed by default", () => {
        const el = mountPageConfiguration();
        const sections = Array.from(el.shadowRoot!.querySelectorAll("p9r-section"));
        const advanced = sections.find(s => s.getAttribute("data-title") === "Advanced");
        expect(advanced).toBeTruthy();
        expect(advanced!.hasAttribute("data-collapsed")).toBe(true);

        const identifier = advanced!.querySelector(`[name=identifier]`);
        expect(identifier).toBeTruthy();
    });

    test("has the five expected sections in order", () => {
        const el = mountPageConfiguration();
        const titles = Array.from(el.shadowRoot!.querySelectorAll("p9r-section"))
            .map(s => s.getAttribute("data-title"));
        expect(titles).toEqual(["SEO", "URL", "Taxonomy", "Publication", "Advanced"]);
    });

    // --- Character counters ---

    test("title counter reflects the current length", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "title", "Hello");
        const count = getCounter(el, "title").querySelector(".count")!;
        expect(count.textContent).toBe("5");
        expect(getCounter(el, "title").dataset.over).toBe("false");
    });

    test("title counter flags overflow past 50 chars", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "title", "x".repeat(51));
        expect(getCounter(el, "title").dataset.over).toBe("true");
    });

    test("description counter flags overflow past 120 chars", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "description", "x".repeat(121));
        expect(getCounter(el, "description").dataset.over).toBe("true");
    });

    test("counters hydrate from default-* attributes on mount", () => {
        const el = mountPageConfiguration({ "default-title": "Hello" });
        const count = getCounter(el, "title").querySelector(".count")!;
        expect(count.textContent).toBe("5");
    });

    // --- Path format validation ---

    test("invalid path format disables the save button", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "no-leading-slash");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBe("true");
        expect(getHint(el).dataset.level).toBe("error");
    });

    test("path with forbidden character (underscore) is rejected", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "/my_page");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBe("true");
        expect(getHint(el).dataset.level).toBe("error");
    });

    test("path with dot (e.g. /robots.txt) is rejected", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "/robots.txt");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBe("true");
        expect(getHint(el).dataset.level).toBe("error");
    });

    test("path with consecutive slashes is rejected", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "/a//b");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBe("true");
        expect(getHint(el).dataset.level).toBe("error");
    });

    test("empty path is flagged as required", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "");
        expect(getHint(el).textContent).toContain("required");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBe("true");
    });

    test("valid format clears the error state (before remote check)", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "/article");
        // Before blur, no remote check has happened — hint reflects sync check only.
        expect(getHint(el).dataset.level).toBe("info");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBeNull();
    });

    // --- URL preview ---

    test("URL preview is hidden when path is empty", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "");
        expect(getPreviewRow(el).hidden).toBe(true);
    });

    test("URL preview shows path when identifier is empty", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "/article");
        expect(getPreviewRow(el).hidden).toBe(false);
        expect(getPreview(el).textContent).toContain("/article");
        expect(getPreview(el).textContent).not.toContain("identifier=");
    });

    test("URL preview appends ?identifier= when identifier is set", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "/article");
        setInputValue(el, "identifier", "v2");
        expect(getPreview(el).textContent).toContain("/article?identifier=v2");
    });

    // --- Open-in-new-tab button ---

    test("open-in-new-tab button is disabled when path format is invalid", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "no-slash");
        expect(getOpenBtn(el).disabled).toBe(true);
    });

    test("open-in-new-tab button is enabled for a valid path", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "/article");
        expect(getOpenBtn(el).disabled).toBe(false);
    });

    test("clicking open-in-new-tab calls window.open with the full URL", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "/article");
        setInputValue(el, "identifier", "v2");

        const opened: Array<{ url: string; target: string }> = [];
        const originalOpen = window.open;
        (window as any).open = (url: string, target: string) => {
            opened.push({ url, target });
            return null;
        };

        getOpenBtn(el).click();

        (window as any).open = originalOpen;
        expect(opened.length).toBe(1);
        expect(opened[0]!.url).toContain("/article?identifier=v2");
        expect(opened[0]!.target).toBe("_blank");
    });

    test("clicking open-in-new-tab is a no-op when path is invalid", () => {
        const el = mountPageConfiguration();
        setInputValue(el, "path", "no-slash");

        let called = 0;
        const originalOpen = window.open;
        (window as any).open = () => { called++; return null; };

        getOpenBtn(el).click();

        (window as any).open = originalOpen;
        expect(called).toBe(0);
    });

    // --- Remote uniqueness check ---

    type PageExistsReply = { exists: boolean; reason?: "taken" | "reserved" };

    /** Records `page-exists` calls only; other fetches (p9r-tag-suggest's
     *  `/api/tags` load) are matched but unrecorded. */
    function mockPageExistsFetch(
        handler: (calledUrls: string[]) => (url: string) => PageExistsReply,
    ): string[] {
        const recorded: string[] = [];
        const respond = handler(recorded);
        globalThis.fetch = (async (input: any) => {
            const u = String(input);
            if (u.includes("page-exists")) {
                recorded.push(u);
                return new Response(JSON.stringify(respond(u)), { status: 200 });
            }
            // stub other calls (e.g. p9r-tag-suggest /api/tags)
            return new Response("[]", { status: 200 });
        }) as unknown as typeof fetch;
        return recorded;
    }

    test("blur on path triggers a remote check and surfaces taken-path collisions", async () => {
        const called = mockPageExistsFetch(() => () => ({ exists: true, reason: "taken" }));

        const el = mountPageConfiguration();
        setInputValue(el, "path", "/article");
        blurInput(el, "path");

        await new Promise(r => setTimeout(r, 0));

        expect(called.length).toBe(1);
        expect(called[0]).toContain("path=%2Farticle");
        expect(getHint(el).dataset.level).toBe("error");
        expect(getHint(el).textContent).toContain("already used");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBe("true");
    });

    test("reserved paths get a distinct error message", async () => {
        mockPageExistsFetch(() => () => ({ exists: true, reason: "reserved" }));

        const el = mountPageConfiguration();
        setInputValue(el, "path", "/bloc");
        blurInput(el, "path");
        await new Promise(r => setTimeout(r, 0));

        expect(getHint(el).dataset.level).toBe("error");
        expect(getHint(el).textContent).toContain("reserved");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBe("true");
    });

    test("remote check reports availability when the path is free", async () => {
        mockPageExistsFetch(() => () => ({ exists: false }));

        const el = mountPageConfiguration();
        setInputValue(el, "path", "/article");
        blurInput(el, "path");
        await new Promise(r => setTimeout(r, 0));

        expect(getHint(el).textContent).toContain("available");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBeNull();
    });

    test("remote check forwards current-path / current-identifier from default-* attrs", async () => {
        const called = mockPageExistsFetch(() => () => ({ exists: false }));

        const el = mountPageConfiguration({
            "default-path": "/article",
            "default-identifier": "v1",
        });
        setInputValue(el, "path", "/article");
        blurInput(el, "path");
        await new Promise(r => setTimeout(r, 0));

        expect(called[0]).toContain("current-path=%2Farticle");
        expect(called[0]).toContain("current-identifier=v1");
    });

    test("a newer blur supersedes an in-flight remote check", async () => {
        let callIndex = 0;
        const responses = [{ exists: true }, { exists: false }];
        mockPageExistsFetch(() => () => responses[callIndex++]!);

        const el = mountPageConfiguration();
        setInputValue(el, "path", "/old");
        blurInput(el, "path");
        // Trigger a second blur before the first promise resolves.
        setInputValue(el, "path", "/new");
        blurInput(el, "path");

        await new Promise(r => setTimeout(r, 0));

        // The second (newer) result wins — hint should reflect "available".
        expect(getHint(el).textContent).toContain("available");
    });
});
