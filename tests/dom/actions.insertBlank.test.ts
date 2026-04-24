import { describe, test, expect, beforeEach } from "bun:test";
import { insertBlankSibling, duplicateSibling } from "src/control/core/editorSystem/components/BlocActionGroup/actions";

beforeEach(() => {
    document.body.innerHTML = "";
    (document as any).compIdentifierToEditor = new Map();
});

function registerParent(parent: HTMLElement, panel: HTMLElement) {
    const id = "parent-" + Math.random().toString(36).slice(2);
    parent.setAttribute(p9r.attr.EDITOR.IDENTIFIER, id);
    (document as any).compIdentifierToEditor.set(id, {
        _panelConfig: panel,
        queryPanelChildren: (sel: string) => Array.from(panel.querySelectorAll(sel)),
    });
    return id;
}

describe("insertBlankSibling", () => {
    test("no parent editor → falls back to <p>", () => {
        const target = document.createElement("div");
        document.body.appendChild(target);

        insertBlankSibling(target, "before");

        expect((target.previousElementSibling as HTMLElement).tagName).toBe("P");
    });

    test("parent comp-sync declares a slot template → uses its tag", () => {
        const parent = document.createElement("hub-grid");
        document.body.appendChild(parent);

        const panel = document.createElement("p9r-config-panel");
        const compSync = document.createElement("p9r-comp-sync");
        const template = document.createElement("hub-card");
        template.setAttribute("slot", "cards");
        compSync.appendChild(template);
        panel.appendChild(compSync);
        const parentId = registerParent(parent, panel);

        const target = document.createElement("hub-card");
        target.setAttribute("slot", "cards");
        target.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, parentId);
        parent.appendChild(target);

        insertBlankSibling(target, "after");

        const fresh = target.nextElementSibling as HTMLElement;
        expect(fresh.tagName).toBe("HUB-CARD");
        expect(fresh.getAttribute("slot")).toBe("cards");
        expect(fresh.hasAttribute(p9r.attr.EDITOR.IS_CREATING)).toBe(true);
    });

    test("multiple comp-syncs → picks the one matching target's slot", () => {
        const parent = document.createElement("hub-section");
        document.body.appendChild(parent);

        const panel = document.createElement("p9r-config-panel");
        const cs1 = document.createElement("p9r-comp-sync");
        const tpl1 = document.createElement("span");
        tpl1.setAttribute("slot", "eyebrow");
        cs1.appendChild(tpl1);
        const cs2 = document.createElement("p9r-comp-sync");
        const tpl2 = document.createElement("hub-card");
        tpl2.setAttribute("slot", "cards");
        cs2.appendChild(tpl2);
        panel.appendChild(cs1);
        panel.appendChild(cs2);
        const parentId = registerParent(parent, panel);

        const target = document.createElement("hub-card");
        target.setAttribute("slot", "cards");
        target.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, parentId);
        parent.appendChild(target);

        insertBlankSibling(target, "after");

        expect((target.nextElementSibling as HTMLElement).tagName).toBe("HUB-CARD");
    });

    test("no matching comp-sync → falls back to <p>", () => {
        const parent = document.createElement("div");
        document.body.appendChild(parent);
        const panel = document.createElement("p9r-config-panel");
        const parentId = registerParent(parent, panel);

        const target = document.createElement("hub-container");
        target.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, parentId);
        parent.appendChild(target);

        insertBlankSibling(target, "after");

        expect((target.nextElementSibling as HTMLElement).tagName).toBe("P");
    });
});

describe("duplicateSibling", () => {
    test("deep-clones target including content", () => {
        const parent = document.createElement("section");
        document.body.appendChild(parent);
        const target = document.createElement("article");
        target.innerHTML = "<h1>Hi</h1>";
        parent.appendChild(target);

        duplicateSibling(target, "after");

        const clone = target.nextElementSibling as HTMLElement;
        expect(clone.innerHTML).toBe("<h1>Hi</h1>");
    });
});
