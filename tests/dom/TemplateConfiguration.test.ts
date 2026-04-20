import { describe, test, expect, beforeEach } from "bun:test";
import { TemplateConfiguration } from "src/core/Editor/components/TemplateConfiguration/TemplateConfiguration";

function mount(attrs: Record<string, string> = {}): TemplateConfiguration {
    document.body.innerHTML = "";
    const el = document.createElement("w13c-template-information") as TemplateConfiguration;
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    return el;
}

function setInputValue(el: TemplateConfiguration, name: string, value: string) {
    const input = el.shadowRoot?.querySelector(`input[name=${name}]`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

function getCounter(el: TemplateConfiguration, fieldName: string): HTMLElement {
    return el.shadowRoot!.querySelector(`.counter[data-for="${fieldName}"]`) as HTMLElement;
}

function stubFetch() {
    (globalThis as any).fetch = async () => new Response("[]", { status: 200 });
}

describe("TemplateConfiguration", () => {

    beforeEach(() => {
        (document as any).EditorManager = {
            ...(document as any).EditorManager,
            getContent: () => "<div>content</div>",
        };
        stubFetch();
    });

    test("registers itself as <w13c-template-information>", () => {
        expect(customElements.get("w13c-template-information")).toBe(
            TemplateConfiguration as unknown as CustomElementConstructor,
        );
    });

    test("has Information and Taxonomy sections", () => {
        const el = mount();
        const titles = Array.from(el.shadowRoot!.querySelectorAll("p9r-section"))
            .map(s => s.getAttribute("data-title"));
        expect(titles).toEqual(["Information", "Taxonomy"]);
    });

    test("name counter updates and flags overflow past 50 chars", () => {
        const el = mount();
        setInputValue(el, "name", "Hello");
        expect(getCounter(el, "name").querySelector(".count")!.textContent).toBe("5");
        expect(getCounter(el, "name").dataset.over).toBe("false");

        setInputValue(el, "name", "x".repeat(51));
        expect(getCounter(el, "name").dataset.over).toBe("true");
    });

    test("description counter flags overflow past 120 chars", () => {
        const el = mount();
        setInputValue(el, "description", "x".repeat(121));
        expect(getCounter(el, "description").dataset.over).toBe("true");
    });

    test("counters hydrate from default-* attributes", () => {
        const el = mount({ "default-name": "Hero" });
        expect(getCounter(el, "name").querySelector(".count")!.textContent).toBe("4");
    });
});
