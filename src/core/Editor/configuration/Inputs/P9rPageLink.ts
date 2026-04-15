import css from "./P9rPageLink.style.css" with { type: "text" };
import { buildOptionList, filterPages, type PageRef } from "./P9rPageLink.picker";
import { whenEditorManagerReady } from "src/core/Editor/core/editorManagerReady";

/**
 * <p9r-page-link name="href" label="Link to a page"></p9r-page-link>
 *
 * Fetches available pages from the admin API and lets the user pick one.
 * Exposes `name` and `value` (the selected path) for <p9r-attr-sync> compatibility.
 */
export class P9rPageLink extends HTMLElement {

    private _trigger: HTMLElement | null = null;
    private _display: HTMLElement | null = null;
    private _list: HTMLElement | null = null;
    private _empty: HTMLElement | null = null;
    private _panel: HTMLElement | null = null;
    private _clearBtn: HTMLElement | null = null;
    private _pageSection: HTMLElement | null = null;
    private _externalSection: HTMLElement | null = null;
    private _externalInput: HTMLInputElement | null = null;
    private _tabPage: HTMLElement | null = null;
    private _tabExternal: HTMLElement | null = null;
    private _options: HTMLElement[] = [];
    private _pages: PageRef[] = [];
    private _isOpen = false;
    private _value = "";
    private _mode: "page" | "external" = "page";

    private _onWindowClick = (e: MouseEvent) => {
        if (this._isOpen && !this.contains(e.target as Node)) this._close();
    };
    private _onTriggerClick = (e: MouseEvent) => {
        e.stopPropagation();
        this._isOpen ? this._close() : this._open();
    };
    private _onTriggerKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") this._close();
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this._isOpen ? this._close() : this._open();
        }
    };
    private _pagesFetched = false;

    constructor() {
        super();
        // attachShadow can only be called once — do it in the constructor so
        // the custom element survives reparenting without a re-render crash.
        this._buildShadow();
    }

    connectedCallback() {
        if (!this._pagesFetched) {
            this._pagesFetched = true;
            whenEditorManagerReady(() => this._fetchPages());
        }
        this._trigger!.addEventListener("click", this._onTriggerClick);
        this._trigger!.addEventListener("keydown", this._onTriggerKeyDown);
        window.addEventListener("click", this._onWindowClick);
    }

    disconnectedCallback() {
        this._trigger?.removeEventListener("click", this._onTriggerClick);
        this._trigger?.removeEventListener("keydown", this._onTriggerKeyDown);
        window.removeEventListener("click", this._onWindowClick);
    }

    private _buildShadow() {
        const label = this.getAttribute("label");
        const shadow = this.attachShadow({ mode: "open" });
        shadow.innerHTML = `
            <style>${css}</style>
            <div class="field">
                ${label ? `<span class="label">${label}</span>` : ""}
                <div class="input-row">
                    <button class="trigger" type="button" tabindex="0">
                        <svg class="link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        <span class="value">No page</span>
                        <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m6 9 6 6 6-6"/>
                        </svg>
                    </button>
                    <button class="clear-btn" type="button" title="Remove link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="panel">
                    <div class="tabs">
                        <button type="button" class="tab tab-page" data-mode="page">Page</button>
                        <button type="button" class="tab tab-external" data-mode="external">External URL</button>
                    </div>
                    <div class="page-section">
                        <div class="search-wrap">
                            <input class="search" type="text" placeholder="Search for a page...">
                        </div>
                        <ul class="list"></ul>
                        <div class="empty">No pages found</div>
                    </div>
                    <div class="external-section">
                        <input class="external-input" type="url" placeholder="https://example.com" spellcheck="false">
                    </div>
                </div>
            </div>
            <div hidden><slot></slot></div>
        `;

        this._trigger = shadow.querySelector(".trigger")!;
        this._display = shadow.querySelector(".value")!;
        this._list = shadow.querySelector(".list")!;
        this._panel = shadow.querySelector(".panel")!;
        this._empty = shadow.querySelector(".empty")!;
        this._clearBtn = shadow.querySelector(".clear-btn")!;
        this._pageSection = shadow.querySelector(".page-section")!;
        this._externalSection = shadow.querySelector(".external-section")!;
        this._externalInput = shadow.querySelector(".external-input")!;
        this._tabPage = shadow.querySelector(".tab-page")!;
        this._tabExternal = shadow.querySelector(".tab-external")!;

        const searchInput = shadow.querySelector(".search") as HTMLInputElement;
        searchInput.addEventListener("input", () => this._refreshOptions(filterPages(this._pages, searchInput.value)));

        this._clearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this._select("", "No page");
        });

        this._tabPage.addEventListener("click", (e) => { e.stopPropagation(); this._setMode("page"); });
        this._tabExternal.addEventListener("click", (e) => { e.stopPropagation(); this._setMode("external"); });

        this._externalInput.addEventListener("input", () => {
            const url = this._externalInput!.value.trim();
            this._setValue(url, url || "No link");
            this.dispatchEvent(new Event("change", { bubbles: true }));
        });
        this._externalInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { e.preventDefault(); this._close(); }
            if (e.key === "Escape") this._close();
        });

        this._applyMode();
    }

    private _isExternal(v: string) {
        return /^(https?:|mailto:|tel:|\/\/)/i.test(v);
    }

    private _setMode(mode: "page" | "external") {
        this._mode = mode;
        this._applyMode();
        if (mode === "external") requestAnimationFrame(() => this._externalInput!.focus());
    }

    private _applyMode() {
        if (!this._pageSection) return;
        const isPage = this._mode === "page";
        this._pageSection!.style.display = isPage ? "" : "none";
        this._externalSection!.style.display = isPage ? "none" : "";
        this._tabPage!.classList.toggle("active", isPage);
        this._tabExternal!.classList.toggle("active", !isPage);
    }

    private async _fetchPages() {
        try {
            const res = await fetch(new URL("pages", document.EditorManager.getApiBasePath()));
            this._pages = await res.json();
            this._refreshOptions(this._pages);

            // Sync with current attribute value
            const currentValue = this.getAttribute("value") || "";
            if (currentValue) {
                if (this._isExternal(currentValue)) {
                    this._mode = "external";
                    this._externalInput!.value = currentValue;
                    this._setValue(currentValue, currentValue);
                    this._applyMode();
                } else {
                    const match = this._pages.find(p => p.path === currentValue);
                    if (match) this._setValue(match.path, match.title);
                }
            }
        } catch (e) {
            console.warn("P9rPageLink: failed to fetch pages", e);
        }
    }

    private _refreshOptions(pages: PageRef[]) {
        this._options = buildOptionList(
            this._list!,
            this._empty!,
            pages,
            (page) => this._select(page.path, page.title),
        );
        // Re-apply selected highlight after rebuilding the list.
        this._options.forEach(li => {
            li.classList.toggle("selected", li.dataset.value === this._value);
        });
    }

    private _select(value: string, label: string) {
        this._setValue(value, label);
        this._close();
        this.dispatchEvent(new Event("change", { bubbles: true }));
    }

    private _setValue(value: string, label: string) {
        this._value = value;
        this._display!.textContent = value ? label : "No page";
        this._trigger!.classList.toggle("has-value", !!value);
        this._clearBtn!.style.display = value ? "flex" : "none";
        this._options.forEach(li => {
            li.classList.toggle("selected", li.dataset.value === value);
        });
    }

    private _open() {
        document.querySelectorAll("p9r-page-link, p9r-select").forEach((el) => {
            if (el !== this && "_close" in el) (el as any)._close();
        });

        this._isOpen = true;
        this._panel!.classList.add("open");
        this._trigger!.classList.add("open");

        const searchInput = this.shadowRoot!.querySelector(".search") as HTMLInputElement;
        searchInput.value = "";
        this._refreshOptions(this._pages);
        requestAnimationFrame(() => {
            if (this._mode === "page") searchInput.focus();
            else this._externalInput!.focus();
        });
    }

    _close() {
        this._isOpen = false;
        this._panel!.classList.remove("open");
        this._trigger!.classList.remove("open");
    }

    get value() { return this._value; }
    set value(v: string) {
        if (this._isExternal(v)) {
            this._mode = "external";
            if (this._externalInput) this._externalInput.value = v;
            this._setValue(v, v);
        } else {
            this._mode = "page";
            const match = this._pages.find(p => p.path === v);
            if (match) this._setValue(match.path, match.title);
            else this._setValue(v, v || "No page");
        }
        this._applyMode();
    }

    get name() { return this.getAttribute("name"); }
}

if (!customElements.get("p9r-page-link")) {
    customElements.define("p9r-page-link", P9rPageLink);
}
