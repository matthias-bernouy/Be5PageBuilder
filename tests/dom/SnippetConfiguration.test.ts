import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { SnippetConfiguration } from "src/core/Editor/components/SnippetConfiguration/SnippetConfiguration";

function mount(attrs: Record<string, string> = {}): SnippetConfiguration {
    document.body.innerHTML = "";
    const el = document.createElement("w13c-snippet-information") as SnippetConfiguration;
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    return el;
}

function setInputValue(el: SnippetConfiguration, name: string, value: string) {
    const input = el.shadowRoot?.querySelector(`input[name=${name}]`) as HTMLInputElement;
    if (!input) throw new Error(`No input[name=${name}]`);
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

function blurInput(el: SnippetConfiguration, name: string) {
    const input = el.shadowRoot?.querySelector(`input[name=${name}]`) as HTMLInputElement;
    input?.dispatchEvent(new Event("blur", { bubbles: true }));
}

function getHint(el: SnippetConfiguration): HTMLElement {
    return el.shadowRoot!.getElementById("identifier-hint") as HTMLElement;
}

function getSaveBtn(el: SnippetConfiguration): HTMLElement {
    return el.shadowRoot!.getElementById("save-btn") as HTMLElement;
}

function getIdentifierInput(el: SnippetConfiguration): HTMLInputElement {
    return el.shadowRoot!.querySelector("input[name=identifier]") as HTMLInputElement;
}

/** Stubs all fetches; records only snippet-exists calls. */
function mockSnippetExistsFetch(respond: (id: string) => { exists: boolean }): string[] {
    const recorded: string[] = [];
    (globalThis as any).fetch = async (input: any) => {
        const u = String(input);
        if (u.includes("snippet-exists")) {
            const match = /identifier=([^&]*)/.exec(u);
            const id = match ? decodeURIComponent(match[1]!) : "";
            recorded.push(u);
            return new Response(JSON.stringify(respond(id)), { status: 200 });
        }
        return new Response("[]", { status: 200 });
    };
    return recorded;
}

describe("SnippetConfiguration", () => {

    const originalFetch = globalThis.fetch;

    beforeEach(() => {
        (document as any).EditorManager = {
            ...(document as any).EditorManager,
            getContent: () => "<div>snippet</div>",
        };
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    // --- Structure ---

    test("registers itself as <w13c-snippet-information>", () => {
        expect(customElements.get("w13c-snippet-information")).toBe(
            SnippetConfiguration as unknown as CustomElementConstructor,
        );
    });

    test("has 4 sections in order", () => {
        mockSnippetExistsFetch(() => ({ exists: false }));
        const el = mount();
        const titles = Array.from(el.shadowRoot!.querySelectorAll("p9r-section"))
            .map(s => s.getAttribute("data-title"));
        expect(titles).toEqual(["Identity", "Information", "Taxonomy", "Usages"]);
    });

    // --- Identifier format ---

    test("empty identifier is flagged as required and disables save", () => {
        mockSnippetExistsFetch(() => ({ exists: false }));
        const el = mount();
        setInputValue(el, "identifier", "");
        expect(getHint(el).textContent).toContain("required");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBe("true");
    });

    test("non-kebab-case identifiers are rejected", () => {
        mockSnippetExistsFetch(() => ({ exists: false }));
        const el = mount();
        setInputValue(el, "identifier", "HeroV1");
        expect(getHint(el).dataset.level).toBe("error");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBe("true");
    });

    test("identifier with trailing dash is rejected", () => {
        mockSnippetExistsFetch(() => ({ exists: false }));
        const el = mount();
        setInputValue(el, "identifier", "hero-");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBe("true");
    });

    test("valid kebab-case identifier is accepted (pre-remote)", () => {
        mockSnippetExistsFetch(() => ({ exists: false }));
        const el = mount();
        setInputValue(el, "identifier", "hero-v1");
        expect(getHint(el).dataset.level).toBe("info");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBeNull();
    });

    // --- Remote uniqueness ---

    test("blur on identifier triggers remote check and surfaces collision", async () => {
        const called = mockSnippetExistsFetch(() => ({ exists: true }));
        const el = mount();
        setInputValue(el, "identifier", "hero-v1");
        blurInput(el, "identifier");
        await new Promise(r => setTimeout(r, 0));

        expect(called.length).toBe(1);
        expect(called[0]).toContain("identifier=hero-v1");
        expect(getHint(el).dataset.level).toBe("error");
        expect(getHint(el).textContent).toContain("already used");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBe("true");
    });

    test("remote check reports availability when identifier is free", async () => {
        mockSnippetExistsFetch(() => ({ exists: false }));
        const el = mount();
        setInputValue(el, "identifier", "hero-v1");
        blurInput(el, "identifier");
        await new Promise(r => setTimeout(r, 0));

        expect(getHint(el).dataset.level).toBe("success");
        expect(getHint(el).textContent).toContain("available");
        expect(getSaveBtn(el).getAttribute("aria-disabled")).toBeNull();
    });

    // --- Edit mode (locked) ---

    test("editing an existing snippet locks the identifier and skips remote check", () => {
        const called = mockSnippetExistsFetch(() => ({ exists: true }));
        const el = mount({ "default-identifier": "hero-v1", "default-id": "abc" });
        const input = getIdentifierInput(el);
        expect(input.disabled).toBe(true);
        expect(input.value).toBe("hero-v1");
        // Blur on the locked input should NOT trigger a remote check.
        blurInput(el, "identifier");
        expect(called.length).toBe(0);
    });

    test("a newer blur supersedes an in-flight remote check", async () => {
        let i = 0;
        const responses = [{ exists: true }, { exists: false }];
        mockSnippetExistsFetch(() => responses[i++]!);

        const el = mount();
        setInputValue(el, "identifier", "first-id");
        blurInput(el, "identifier");
        setInputValue(el, "identifier", "second-id");
        blurInput(el, "identifier");

        await new Promise(r => setTimeout(r, 0));
        expect(getHint(el).textContent).toContain("available");
    });
});
