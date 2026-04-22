import { send_html } from 'src/control/server/send_html';
import { escapeHtml } from 'src/socle/utils/escapeHtml';
import { parseHTML } from 'linkedom';
import type { ControlCms } from 'src/control/ControlCms';
import type { TPageRef } from 'src/socle/contracts/Repository/TModels';
import template from "./settings.html";

/** Composite value used in option[value] for page selects. */
function encodeRef(ref: TPageRef): string {
    if (!ref) return "";
    return `${ref.path}::${ref.identifier}`;
}

export default async function Server(_req: Request, cms: ControlCms) {
    const { document } = parseHTML(await Bun.file(template.index).text());

    const settings = await cms.repository.getSystem();
    const pages = await cms.repository.getAllPages();
    const templates = await cms.repository.getAllTemplates();

    // ── Page-reference selects (notFound / serverError) ─────────────────
    const pageSelects: { id: string; current: TPageRef }[] = [
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
            select.innerHTML += `<option value="${escapeHtml(value)}"${selected}>${escapeHtml(label)}</option>`;
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
            layoutSelect.innerHTML += `<option value="${escapeHtml(cat)}"${selected}>${escapeHtml(cat)}</option>`;
        }

        // If the saved value is a category that no longer exists (template
        // renamed), still expose it so the user sees/can clear it.
        if (currentLayout && !categories.includes(currentLayout)) {
            layoutSelect.innerHTML += `<option value="${escapeHtml(currentLayout)}" selected>${escapeHtml(currentLayout)} (missing)</option>`;
        }
    }

    // ── Language select: mark the saved BCP-47 tag as selected ──────────
    const languageSelect = document.getElementById("site-language");
    const currentLanguage = settings.site?.language ?? "";
    if (languageSelect) {
        const options = languageSelect.querySelectorAll("option");
        let matched = false;
        options.forEach(opt => {
            opt.removeAttribute("selected");
            if (opt.getAttribute("value") === currentLanguage) {
                opt.setAttribute("selected", "");
                matched = true;
            }
        });
        // Preserve a legacy tag that isn't in the curated list so the user
        // can still see and clear it instead of silently losing it.
        if (!matched && currentLanguage) {
            languageSelect.innerHTML += `<option value="${escapeHtml(currentLanguage)}" selected>${escapeHtml(currentLanguage)} (custom)</option>`;
        }
    }

    // ── Plain string values ─────────────────────────────────────────────
    const stringValues: Record<string, string> = {
        "site-name":    settings.site?.name ?? "",
        "site-favicon": settings.site?.favicon ?? "",
        "site-host":    settings.site?.host ?? "",
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
        const adminPrefix = cms.config.adminPathPrefix || "/cms";
        const clientPrefix = cms.config.clientPathPrefix || "/";
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
