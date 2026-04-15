import { describe, test, expect, beforeEach } from "bun:test";
import { ImageSync } from "src/core/Editor/configuration/Sync/ImageSync";

function reset() {
    document.body.innerHTML = "";
    const host = document.createElement("div");
    host.id = p9r.id.EDITOR_SYSTEM;
    document.body.appendChild(host);
}

function nextFrames(n: number): Promise<void> {
    return new Promise((r) => {
        const tick = (left: number) => left === 0 ? r() : requestAnimationFrame(() => tick(left - 1));
        tick(n);
    });
}

function buildPairWithImage(initialSrc: string) {
    reset();
    const parentId = "img-parent-" + Math.random().toString(36).slice(2);
    const parent = document.createElement("div");
    parent.setAttribute(p9r.attr.EDITOR.IDENTIFIER, parentId);
    const img = document.createElement("img");
    img.setAttribute("src", initialSrc);
    parent.appendChild(img);
    document.body.appendChild(parent);

    const sync = new ImageSync();
    sync.setAttribute(p9r.attr.EDITOR.PARENT_IDENTIFIER, parentId);
    document.body.appendChild(sync);

    return { parent, sync, img };
}

describe("ImageSync — preview mirrors external src mutations", () => {
    beforeEach(() => reset());

    test("changing the target <img> src updates the preview", async () => {
        const { sync, img } = buildPairWithImage("https://example.com/a.jpg");
        await nextFrames(1);

        const preview = sync.querySelector("img") as HTMLImageElement;
        expect(preview.src).toContain("a.jpg");

        img.setAttribute("src", "https://example.com/b.jpg");
        // MutationObserver callbacks run on a microtask.
        await Promise.resolve();
        await Promise.resolve();

        expect(preview.src).toContain("b.jpg");
    });

    test("after _clear(), further mutations on the old img don't blow up", async () => {
        const { sync, img } = buildPairWithImage("https://example.com/a.jpg");
        await nextFrames(1);

        const removeBtn = sync.querySelector("button.btn-remove") as HTMLButtonElement;
        removeBtn.click();

        // Mutate the now-detached node — observer should be disconnected,
        // so this is a no-op with no thrown errors.
        expect(() => img.setAttribute("src", "https://example.com/c.jpg")).not.toThrow();
    });
});
