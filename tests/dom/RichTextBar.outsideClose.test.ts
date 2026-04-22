import { describe, test, expect, beforeEach } from "bun:test";
import { EditorToolbar } from "src/control/editor/components/RichTextBar/RichTextBar";

beforeEach(() => { document.body.innerHTML = ""; });

function setRange(el: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
}

describe("RichTextBar — outside mousedown closes the bar", () => {
    test("mousedown on a sibling outside the editable hides the bar", () => {
        const parent = document.createElement("div");
        const editable = document.createElement("p");
        editable.setAttribute("contenteditable", "true");
        editable.textContent = "hello";
        const sibling = document.createElement("button");
        parent.appendChild(editable);
        parent.appendChild(sibling);
        document.body.appendChild(parent);

        const bar = new EditorToolbar();
        document.body.appendChild(bar);
        setRange(editable);
        (bar as any).selection.save();
        bar.classList.add("visible");

        sibling.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

        expect(bar.classList.contains("visible")).toBe(false);
    });

    test("mousedown inside the editable keeps the bar open", () => {
        const editable = document.createElement("p");
        editable.setAttribute("contenteditable", "true");
        editable.textContent = "hello";
        document.body.appendChild(editable);

        const bar = new EditorToolbar();
        document.body.appendChild(bar);
        setRange(editable);
        (bar as any).selection.save();
        bar.classList.add("visible");

        editable.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

        expect(bar.classList.contains("visible")).toBe(true);
    });
});
