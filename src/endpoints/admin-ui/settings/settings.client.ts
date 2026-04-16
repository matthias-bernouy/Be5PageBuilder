import "src/core/Editor/configuration/Inputs/P9rSelect";
import "src/core/Editor/components/MediaCenter/MediaCenter";

type PageRef = { path: string; identifier: string } | null;

/**
 * Decode a composite `path::identifier` string back into a structured page
 * reference. An empty string means "not set". We use `::` as the separator
 * because `:` is reserved in paths (see isValidPathFormat).
 */
function decodePageRef(raw: string): PageRef {
    if (!raw) return null;
    const idx = raw.indexOf("::");
    if (idx === -1) return { path: raw, identifier: "" };
    return {
        path: raw.slice(0, idx),
        identifier: raw.slice(idx + 2),
    };
}

document.addEventListener("DOMContentLoaded", () => {
    // ── Favicon picker ─────────────────────────────────────────────────
    const mc = document.getElementById("favicon-mediacenter") as any;
    const faviconHidden = document.getElementById("site-favicon") as HTMLInputElement | null;
    const faviconPicker = document.getElementById("favicon-picker");
    const faviconPreview = document.getElementById("favicon-preview") as HTMLImageElement | null;
    const faviconTitle = document.getElementById("favicon-title");
    const faviconSubtitle = document.getElementById("favicon-subtitle");
    const faviconClear = document.getElementById("favicon-clear");

    const setFaviconValue = (src: string, label?: string) => {
        if (faviconHidden) faviconHidden.value = src;
        const empty = !src;
        faviconPicker?.setAttribute("data-empty", String(empty));
        if (empty) {
            faviconPreview?.removeAttribute("src");
            if (faviconTitle) faviconTitle.textContent = "Choose a favicon";
            if (faviconSubtitle) faviconSubtitle.textContent = "Click to pick from the Media Center";
        } else {
            faviconPreview?.setAttribute("src", src);
            if (faviconTitle) faviconTitle.textContent = label || "Favicon selected";
            if (faviconSubtitle) faviconSubtitle.textContent = src;
        }
    };

    faviconPicker?.addEventListener("click", (e) => {
        // The inline clear button sits inside the picker tile; don't open the
        // MediaCenter when the user clicks it.
        if ((e.target as HTMLElement).closest("#favicon-clear")) return;
        mc?.show(["image"]);
    });
    mc?.addEventListener("select-item", (e: Event) => {
        const detail = (e as CustomEvent<{ src: string; alt?: string }>).detail;
        setFaviconValue(detail?.src ?? "", detail?.alt);
    });
    faviconClear?.addEventListener("click", (e) => {
        e.stopPropagation();
        setFaviconValue("");
    });

    const saveBtn = document.getElementById("save-btn");
    if (!saveBtn) return;

    saveBtn.addEventListener("click", async () => {
        const form = document.getElementById("settings-form") as HTMLFormElement;
        const body: Record<string, Record<string, unknown>> = {};

        // Text-like inputs (w13c-input), raw <textarea>, and plain hidden inputs
        const textInputs = form.querySelectorAll<HTMLElement>(
            "w13c-input, textarea, input"
        );
        textInputs.forEach(el => {
            const name = el.getAttribute("name");
            if (!name) return;
            const [section, key] = name.split(".");
            if (!section || !key) return;
            if (!body[section]) body[section] = {};
            body[section]![key] = (el as any).value ?? "";
        });

        // p9r-select with composite page values or plain string values
        const selects = form.querySelectorAll<HTMLElement>("p9r-select");
        selects.forEach(el => {
            const name = el.getAttribute("name");
            if (!name) return;
            const [section, key] = name.split(".");
            if (!section || !key) return;
            if (!body[section]) body[section] = {};
            const rawValue = (el as any).value ?? "";

            // site.home / site.notFound / site.serverError are PageRefs;
            // everything else is a plain string (e.g. editor.layoutCategory).
            const isPageRef =
                section === "site" &&
                (key === "home" || key === "notFound" || key === "serverError");
            body[section]![key] = isPageRef ? decodePageRef(rawValue) : rawValue;
        });

        const res = await fetch("../api/system", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            alert("Settings saved");
        } else {
            alert("Error saving settings");
        }
    });
});
