import { send_html } from 'src/server/send_html';
import { parseHTML } from 'linkedom';
import type { PageBuilder } from 'src/PageBuilder';
import type { TPageRef } from 'src/interfaces/contract/Repository/TModels';
import template from "./settings.html";

/** Composite value used in option[value] for page selects. */
function encodeRef(ref: TPageRef): string {
    if (!ref) return "";
    return `${ref.path}::${ref.identifier}`;
}

export default async function Server(_req: Request, system: PageBuilder) {
    const { document } = parseHTML(await Bun.file(template.index).text());

    const settings = await system.repository.getSystem();
    const pages = await system.repository.getAllPages();
    const templates = await system.repository.getAllTemplates();

    // ── Page-reference selects (home / notFound / serverError) ──────────
    const pageSelects: { id: string; current: TPageRef }[] = [
        { id: "site-home",        current: settings.site?.home ?? null },
        { id: "site-notFound",    current: settings.site?.notFound ?? null },
        { id: "site-serverError", current: settings.site?.serverError ?? null },
    ];

    const sortedPages = [...pages].sort((a, b) =>
        (a.title || a.path).localeCompare(b.title || b.path)
    );

    for (const { id, current } of pageSelects) {
        const select = document.getElementById(id);
        if (!select) continue;

        const currentValue = encodeRef(current);

        // "-- None --" first
        select.innerHTML += `<option value=""${currentValue === "" ? " selected" : ""}>-- None --</option>`;

        for (const page of sortedPages) {
            const value = encodeRef({ path: page.path, identifier: page.identifier });
            const label = page.identifier
                ? `${page.title || "(untitled)"} — ${page.path}?identifier=${page.identifier}`
                : `${page.title || "(untitled)"} — ${page.path}`;
            const selected = value === currentValue ? " selected" : "";
            select.innerHTML += `<option value="${value}"${selected}>${label}</option>`;
        }
    }

    // ── Layout category select ──────────────────────────────────────────
    const layoutSelect = document.getElementById("editor-layoutCategory");
    if (layoutSelect) {
        const categories = Array.from(
            new Set(templates.map(t => (t.category || "").trim()).filter(Boolean))
        ).sort();

        const currentLayout = settings.editor?.layoutCategory ?? "";

        layoutSelect.innerHTML += `<option value=""${currentLayout === "" ? " selected" : ""}>-- None --</option>`;

        for (const cat of categories) {
            const selected = cat === currentLayout ? " selected" : "";
            layoutSelect.innerHTML += `<option value="${cat}"${selected}>${cat}</option>`;
        }

        // If the saved value is a category that no longer exists (template
        // renamed), still expose it so the user sees/can clear it.
        if (currentLayout && !categories.includes(currentLayout)) {
            layoutSelect.innerHTML += `<option value="${currentLayout}" selected>${currentLayout} (missing)</option>`;
        }
    }

    // ── Plain string values ─────────────────────────────────────────────
    const stringValues: Record<string, string> = {
        "site-name":               settings.site?.name ?? "",
        "site-favicon":            settings.site?.favicon ?? "",
        "site-host":               settings.site?.host ?? "",
        "site-language":           settings.site?.language ?? "",
        "seo-titleTemplate":       settings.seo?.titleTemplate ?? "%s",
        "seo-defaultDescription":  settings.seo?.defaultDescription ?? "",
        "seo-defaultOgImage":      settings.seo?.defaultOgImage ?? "",
    };

    for (const [id, value] of Object.entries(stringValues)) {
        const el = document.getElementById(id);
        if (!el) continue;
        el.setAttribute("value", value);
    }

    // Favicon picker: hydrate the tile so the correct empty/set state is
    // rendered without a client-side flicker.
    const faviconPicker = document.getElementById("favicon-picker");
    const faviconPreview = document.getElementById("favicon-preview");
    const faviconTitle = document.getElementById("favicon-title");
    const faviconSubtitle = document.getElementById("favicon-subtitle");
    const currentFavicon = settings.site?.favicon ?? "";
    if (faviconPicker) {
        faviconPicker.setAttribute("data-empty", currentFavicon ? "false" : "true");
    }
    if (currentFavicon) {
        faviconPreview?.setAttribute("src", currentFavicon);
        if (faviconTitle) faviconTitle.textContent = "Favicon selected";
        if (faviconSubtitle) faviconSubtitle.textContent = currentFavicon;
    }

    // Point the standalone MediaCenter at the current plugin prefix so it
    // doesn't need an EditorManager on this page.
    const mc = document.getElementById("favicon-mediacenter");
    if (mc) {
        const adminPrefix = system.config.adminPathPrefix || "/page-builder";
        const clientPrefix = system.config.clientPathPrefix || "/";
        mc.setAttribute("api-base", `${adminPrefix}/api`);
        mc.setAttribute("public-root", clientPrefix);
    }

    // Theme CSS goes into the <textarea> body, not a `value` attribute.
    const themeArea = document.getElementById("site-theme");
    if (themeArea) {
        themeArea.textContent = settings.site?.theme ?? "";
    }

    return send_html(document.toString());
}
