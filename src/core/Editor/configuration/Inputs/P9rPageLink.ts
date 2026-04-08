/**
 * <p9r-page-link name="href" label="Lien vers une page"></p9r-page-link>
 *
 * Fetches available pages from the admin API and lets the user pick one.
 * Exposes `name` and `value` (the selected path) for <p9r-attr-sync> compatibility.
 */
export class P9rPageLink extends HTMLElement {

    private _trigger: HTMLElement | null = null;
    private _display: HTMLElement | null = null;
    private _list: HTMLElement | null = null;
    private _panel: HTMLElement | null = null;
    private _clearBtn: HTMLElement | null = null;
    private _options: HTMLElement[] = [];
    private _pages: { title: string; path: string }[] = [];
    private _isOpen = false;
    private _value = "";

    connectedCallback() {
        this._render();
        this._fetchPages();

        this._trigger!.addEventListener("click", (e) => {
            e.stopPropagation();
            this._isOpen ? this._close() : this._open();
        });

        window.addEventListener("click", (e) => {
            if (this._isOpen && !this.contains(e.target as Node)) this._close();
        });

        this._trigger!.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Escape") this._close();
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                this._isOpen ? this._close() : this._open();
            }
        });
    }

    private _render() {
        const label = this.getAttribute("label");

        const shadow = this.attachShadow({ mode: "open" });
        shadow.innerHTML = `
            <style>${P9rPageLink._css}</style>
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
                    <button class="clear-btn" type="button" title="Retirer le lien">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div class="panel">
                    <div class="search-wrap">
                        <input class="search" type="text" placeholder="Search for a page...">
                    </div>
                    <ul class="list"></ul>
                    <div class="empty">No pages found</div>
                </div>
            </div>
            <div hidden><slot></slot></div>
        `;

        this._trigger = shadow.querySelector(".trigger")!;
        this._display = shadow.querySelector(".value")!;
        this._list = shadow.querySelector(".list")!;
        this._panel = shadow.querySelector(".panel")!;
        this._clearBtn = shadow.querySelector(".clear-btn")!;

        const searchInput = shadow.querySelector(".search") as HTMLInputElement;
        searchInput.addEventListener("input", () => this._filter(searchInput.value));

        this._clearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this._select("", "No page");
        });
    }

    private async _fetchPages() {
        try {
            const prefix = (document as any).EditorManager?._system?.config?.adminPathPrefix || "/page-builder";
            const res = await fetch(`${prefix}/api/pages`);
            this._pages = await res.json();
            this._buildOptions(this._pages);

            // Sync with current attribute value
            const currentValue = this.getAttribute("value") || "";
            if (currentValue) {
                const match = this._pages.find(p => p.path === currentValue);
                if (match) this._setValue(match.path, match.title);
            }
        } catch (e) {
            console.warn("P9rPageLink: failed to fetch pages", e);
        }
    }

    private _buildOptions(pages: { title: string; path: string }[]) {
        this._list!.innerHTML = "";
        this._options = [];
        const empty = this.shadowRoot!.querySelector(".empty") as HTMLElement;

        if (pages.length === 0) {
            empty.style.display = "block";
            return;
        }
        empty.style.display = "none";

        pages.forEach((page) => {
            const li = document.createElement("li");
            li.className = "option";
            li.dataset.value = page.path;

            const title = document.createElement("span");
            title.className = "option-title";
            title.textContent = page.title;

            const path = document.createElement("span");
            path.className = "option-path";
            path.textContent = page.path;

            li.appendChild(title);
            li.appendChild(path);

            li.addEventListener("click", () => this._select(page.path, page.title));

            this._list!.appendChild(li);
            this._options.push(li);
        });
    }

    private _filter(query: string) {
        const q = query.toLowerCase();
        const filtered = this._pages.filter(p =>
            p.title.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
        );
        this._buildOptions(filtered);
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
            if (el !== this && '_close' in el) (el as any)._close();
        });

        this._isOpen = true;
        this._panel!.classList.add("open");
        this._trigger!.classList.add("open");

        const searchInput = this.shadowRoot!.querySelector(".search") as HTMLInputElement;
        searchInput.value = "";
        this._buildOptions(this._pages);
        requestAnimationFrame(() => searchInput.focus());
    }

    _close() {
        this._isOpen = false;
        this._panel!.classList.remove("open");
        this._trigger!.classList.remove("open");
    }

    get value() { return this._value; }
    set value(v: string) {
        const match = this._pages.find(p => p.path === v);
        if (match) this._setValue(match.path, match.title);
        else this._setValue(v, v || "No page");
    }

    get name() { return this.getAttribute("name"); }

    private static _css = `
        :host {
            display: block;
        }

        .field {
            display: flex;
            flex-direction: column;
            gap: 6px;
            position: relative;
        }

        .label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--text-muted, #94a3b8);
        }

        .input-row {
            display: flex;
            gap: 4px;
        }

        /* ── Trigger ── */

        .trigger {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
            padding: 7px 10px;
            border: 1px solid var(--border-default, #e2e8f0);
            border-radius: 8px;
            background: var(--bg-surface, #fff);
            cursor: pointer;
            transition: border-color 0.15s, box-shadow 0.15s;
            outline: none;
        }

        .trigger:hover {
            border-color: var(--text-muted, #94a3b8);
        }

        .trigger:focus-visible {
            border-color: var(--primary-base, #4361ee);
            box-shadow: 0 0 0 3px var(--primary-muted, rgb(67 97 238 / 0.15));
        }

        .trigger.open {
            border-color: var(--primary-base, #4361ee);
        }

        .trigger.has-value {
            border-color: var(--primary-base, #4361ee);
            background: var(--primary-muted, rgb(67 97 238 / 0.06));
        }

        .link-icon {
            flex-shrink: 0;
            color: var(--text-muted, #94a3b8);
        }

        .trigger.has-value .link-icon {
            color: var(--primary-base, #4361ee);
        }

        .value {
            flex: 1;
            font-size: 12px;
            font-weight: 500;
            color: var(--text-main, #1e293b);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .chevron {
            flex-shrink: 0;
            color: var(--text-muted, #94a3b8);
            transition: transform 0.2s ease;
        }

        .trigger.open .chevron {
            transform: rotate(180deg);
            color: var(--primary-base, #4361ee);
        }

        /* ── Clear button ── */

        .clear-btn {
            display: none;
            align-items: center;
            justify-content: center;
            width: 32px;
            border: 1px solid var(--border-default, #e2e8f0);
            border-radius: 8px;
            background: var(--bg-surface, #fff);
            color: var(--text-muted, #94a3b8);
            cursor: pointer;
            transition: color 0.15s, border-color 0.15s, background 0.15s;
            flex-shrink: 0;
        }

        .clear-btn:hover {
            color: var(--danger-base, #ef4444);
            border-color: var(--danger-base, #ef4444);
            background: color-mix(in srgb, var(--danger-base, #ef4444) 6%, transparent);
        }

        /* ── Panel ── */

        .panel {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 4px;
            background: var(--bg-surface, #fff);
            border: 1px solid var(--border-default, #e2e8f0);
            border-radius: 8px;
            box-shadow: 0 8px 20px rgb(0 0 0 / 0.08);
            z-index: 50;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-4px);
            transition: opacity 0.15s, visibility 0.15s, transform 0.15s;
            overflow: hidden;
        }

        .panel.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        /* ── Search ── */

        .search-wrap {
            padding: 6px 6px 2px;
        }

        .search {
            width: 100%;
            padding: 6px 8px;
            border: 1px solid var(--border-default, #e2e8f0);
            border-radius: 6px;
            background: var(--bg-base, #f8fafc);
            font-size: 11px;
            font-family: inherit;
            color: var(--text-main, #1e293b);
            outline: none;
            transition: border-color 0.15s;
            box-sizing: border-box;
        }

        .search:focus {
            border-color: var(--primary-base, #4361ee);
        }

        .search::placeholder {
            color: var(--text-muted, #94a3b8);
        }

        /* ── List ── */

        .list {
            list-style: none;
            margin: 0;
            padding: 4px;
            max-height: 200px;
            overflow-y: auto;
        }

        .empty {
            display: none;
            padding: 12px;
            text-align: center;
            font-size: 11px;
            color: var(--text-muted, #94a3b8);
        }

        /* ── Option ── */

        .option {
            display: flex;
            flex-direction: column;
            gap: 1px;
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.1s;
        }

        .option:hover {
            background: var(--bg-base, #f1f5f9);
        }

        .option.selected {
            background: var(--primary-muted, rgb(67 97 238 / 0.1));
        }

        .option-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-main, #1e293b);
        }

        .option.selected .option-title {
            color: var(--primary-base, #4361ee);
        }

        .option-path {
            font-size: 10px;
            color: var(--text-muted, #94a3b8);
            font-family: monospace;
        }
    `;
}

if (!customElements.get("p9r-page-link")) {
    customElements.define("p9r-page-link", P9rPageLink);
}
