import "src/core/Editor/configuration/Inputs/P9rSelect";

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
    const saveBtn = document.getElementById("save-btn");
    if (!saveBtn) return;

    saveBtn.addEventListener("click", async () => {
        const form = document.getElementById("settings-form") as HTMLFormElement;
        const body: Record<string, Record<string, unknown>> = {};

        // Text-like inputs (w13c-input) and raw <textarea>
        const textInputs = form.querySelectorAll<HTMLElement>(
            "w13c-input, textarea"
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
