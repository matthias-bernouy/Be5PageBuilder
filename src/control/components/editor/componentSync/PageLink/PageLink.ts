import getClosestEditorSystem from "src/control/core/dom/getClosestEditorSystem";
import css from "./PageLink.css" with { type: "text" };
import { buildOptionList, filterPages, type PageRef } from "./PageLink.picker";
import type { MediaCenter } from "../../MediaCenter/MediaCenter";
import { getMetaApiPath } from "src/control/core/dom/getMetaApiPath";
import resolveApiUrl from "src/control/core/dom/resolveApiUrl";

type LinkMode = "page" | "external" | "media";

/**
 * <p9r-link name="href" label="Link"></p9r-link>
 *
 * Lets the user pick a target for an `href`-style attribute: an internal
 * page, a raw external URL, or a media file via the MediaCenter. Stores the
 * result as a plain string so downstream `<p9r-attr-sync>` stays unchanged.
 */
export class PageLink extends HTMLElement {

    private _mediaCenter: MediaCenter | null = null;
    private _trigger: HTMLElement | null = null;
    private _display: HTMLElement | null = null;
    private _list: HTMLElement | null = null;
    private _empty: HTMLElement | null = null;
    private _panel: HTMLElement | null = null;
    private _clearBtn: HTMLElement | null = null;
    private _pageSection: HTMLElement | null = null;
    private _externalSection: HTMLElement | null = null;
    private _mediaSection: HTMLElement | null = null;
    private _externalInput: HTMLInputElement | null = null;
    private _mediaPickBtn: HTMLElement | null = null;
    private _mediaCurrent: HTMLElement | null = null;
    private _tabPage: HTMLElement | null = null;
    private _tabExternal: HTMLElement | null = null;
    private _tabMedia: HTMLElement | null = null;
    private _options: HTMLElement[] = [];
    private _pages: PageRef[] = [];
    private _isOpen = false;
    private _value = "";
    private _mode: LinkMode = "page";

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
            this._fetchPages();
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
                        <span class="value">No link</span>
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
                        <button type="button" class="tab tab-media" data-mode="media">Media</button>
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
                    <div class="media-section">
                        <button type="button" class="media-pick-btn">Choose a media file…</button>
                        <div class="media-current"></div>
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
        this._mediaSection = shadow.querySelector(".media-section")!;
        this._externalInput = shadow.querySelector(".external-input")!;
        this._mediaPickBtn = shadow.querySelector(".media-pick-btn")!;
        this._mediaCurrent = shadow.querySelector(".media-current")!;
        this._tabPage = shadow.querySelector(".tab-page")!;
        this._tabExternal = shadow.querySelector(".tab-external")!;
        this._tabMedia = shadow.querySelector(".tab-media")!;

        const searchInput = shadow.querySelector(".search") as HTMLInputElement;
        searchInput.addEventListener("input", () => this._refreshOptions(filterPages(this._pages, searchInput.value)));

        this._clearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this._select("", "No link");
        });

        this._tabPage.addEventListener("click", (e) => { e.stopPropagation(); this._setMode("page"); });
        this._tabExternal.addEventListener("click", (e) => { e.stopPropagation(); this._setMode("external"); });
        this._tabMedia.addEventListener("click", (e) => { e.stopPropagation(); this._setMode("media"); });

        this._externalInput.addEventListener("input", () => {
            const url = this._externalInput!.value.trim();
            this._setValue(url, url || "No link");
            this.dispatchEvent(new Event("change", { bubbles: true }));
        });
        this._externalInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { e.preventDefault(); this._close(); }
            if (e.key === "Escape") this._close();
        });

        this._mediaPickBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this._openMediaCenter();
        });

        this._applyMode();
    }

    private _isExternal(v: string) {
        return /^(https?:|mailto:|tel:|\/\/)/i.test(v);
    }

    private _isMedia(v: string) {
        return /(^|\/)media\?id=/.test(v);
    }

    private _setMode(mode: LinkMode) {
        this._mode = mode;
        this._applyMode();
        if (mode === "external") requestAnimationFrame(() => this._externalInput!.focus());
    }

    private _applyMode() {
        if (!this._pageSection) return;
        this._pageSection.style.display = this._mode === "page" ? "" : "none";
        this._externalSection!.style.display = this._mode === "external" ? "" : "none";
        this._mediaSection!.style.display = this._mode === "media" ? "" : "none";
        this._tabPage!.classList.toggle("active", this._mode === "page");
        this._tabExternal!.classList.toggle("active", this._mode === "external");
        this._tabMedia!.classList.toggle("active", this._mode === "media");
    }

    private _openMediaCenter() {
        const mediaCenter = document.createElement("cms-media-center") as MediaCenter;
        const editorSystem = getClosestEditorSystem(this);
        editorSystem.editorDOM.append(mediaCenter);

        requestAnimationFrame(() => {
            this._mediaCenter = mediaCenter;
            if (!mediaCenter) return;
            const handler = (e: Event) => {
                mediaCenter.removeEventListener("select-item", handler);
                const src = (e as CustomEvent).detail?.src as string | undefined;
                if (!src) return;
                this._setValue(src, this._mediaLabel(src));
                this.dispatchEvent(new Event("change", { bubbles: true }));
                this._mediaCenter?.remove();
            };
            mediaCenter.addEventListener("select-item", handler);
            mediaCenter.show(["folder", "image", "other"]);
        })

    }

    private _mediaLabel(src: string): string {
        const m = src.match(/id=([^&]+)/);
        return m ? `Media ${m[1]}` : src;
    }

    private async _fetchPages() {
        try {
            const res = await fetch(resolveApiUrl("page/list"));
            const json = await res.json();
            this._pages = json.pages;
            this._refreshOptions(this._pages);

            const currentValue = this.getAttribute("value") || "";
            if (currentValue) {
                if (this._isMedia(currentValue)) {
                    this._mode = "media";
                    this._setValue(currentValue, this._mediaLabel(currentValue));
                } else if (this._isExternal(currentValue)) {
                    this._mode = "external";
                    this._externalInput!.value = currentValue;
                    this._setValue(currentValue, currentValue);
                } else {
                    const match = this._pages.find(p => p.path === currentValue);
                    if (match) this._setValue(match.path, match.title);
                }
                this._applyMode();
            }
        } catch (e) {
            console.warn("P9rLink: failed to fetch pages", e);
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
        this._display!.textContent = value ? label : "No link";
        this._trigger!.classList.toggle("has-value", !!value);
        this._clearBtn!.style.display = value ? "flex" : "none";
        this._options.forEach(li => {
            li.classList.toggle("selected", li.dataset.value === value);
        });
        if (this._mediaCurrent) {
            const isMediaValue = this._isMedia(value);
            this._mediaCurrent.textContent = isMediaValue ? value : "";
            this._mediaCurrent.classList.toggle("has-value", isMediaValue);
        }
    }

    private _open() {
        document.querySelectorAll("p9r-link, p9r-select").forEach((el) => {
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
            else if (this._mode === "external") this._externalInput!.focus();
        });
    }

    _close() {
        this._isOpen = false;
        this._panel!.classList.remove("open");
        this._trigger!.classList.remove("open");
    }

    get value() { return this._value; }
    set value(v: string) {
        if (this._isMedia(v)) {
            this._mode = "media";
            this._setValue(v, this._mediaLabel(v));
        } else if (this._isExternal(v)) {
            this._mode = "external";
            if (this._externalInput) this._externalInput.value = v;
            this._setValue(v, v);
        } else {
            this._mode = "page";
            const match = this._pages.find(p => p.path === v);
            if (match) this._setValue(match.path, match.title);
            else this._setValue(v, v || "No link");
        }
        this._applyMode();
    }

    get name() { return this.getAttribute("name"); }
}

if (!customElements.get("p9r-link")) {
    customElements.define("p9r-link", PageLink);
}
