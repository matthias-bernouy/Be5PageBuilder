import { Component, type ComponentMetadata } from 'src/core/Editor/core/Component';
import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import {
    renderBlocSection,
    renderSearchResults,
    renderSnippetSection,
    renderTemplateSection,
    type BlocMeta,
    type InsertDetail,
    type SnippetItem,
    type TemplateItem,
} from './sections';

type Section = 'blocs' | 'templates' | 'snippets';

export type BlocLibraryOptions = {
    /** Tab to open on. Defaults to 'blocs'. */
    section?: Section;
    /** Sidebar group/category to pre-select. */
    category?: string;
    /**
     * When true, hides the tab bar and the sidebar, forcing the user to pick
     * from a single category in the given section. Used by the "pick a
     * layout" flow on new-page creation.
     */
    locked?: boolean;
};

export const ActionBarMetadata: ComponentMetadata = {
    css: css,
    template: html as unknown as string
}

/** Lightweight bloc metadata from `/api/blocs-list` — name/group/description by tag. */
type BlocListEntry = { id: string; name: string; group: string; description: string };

export class BlocLibrary extends Component {
    private static instance: BlocLibrary | null = null;
    private _dialog: HTMLDialogElement | null = null;
    private _section: Section = 'blocs';
    private _activeGroup: string | null = null;
    private _templates: TemplateItem[] = [];
    private _snippets: SnippetItem[] = [];
    private _blocMeta: Map<string, BlocMeta> = new Map();
    private _locked: boolean = false;
    private _forcedCategory: string | null = null;
    private _query: string = '';

    constructor(options?: BlocLibraryOptions) {
        super(ActionBarMetadata);
        if (options?.section) this._section = options.section;
        if (options?.category) {
            this._forcedCategory = options.category;
            this._activeGroup = options.category;
        }
        this._locked = !!options?.locked;
    }

    override connectedCallback() {
        const s = this.shadowRoot!;
        this._dialog = s.querySelector('#action-bar-dialog') as HTMLDialogElement;

        this._dialog.addEventListener('close', () => this.remove());
        this._dialog.addEventListener('click', (e) => {
            if (e.target === this._dialog) this.close();
        });

        // Tab clicks (disabled when locked)
        s.getElementById('tabs')!.addEventListener('click', (e) => {
            if (this._locked) return;
            const tab = (e.target as HTMLElement).closest('.tab:not(.disabled)') as HTMLElement;
            if (!tab) return;
            this._section = tab.dataset.section as Section;
            this._activeGroup = null;
            this._render();
        });

        // Sidebar clicks (disabled when locked)
        s.getElementById('sidebar')!.addEventListener('click', (e) => {
            if (this._locked) return;
            const item = (e.target as HTMLElement).closest('.sidebar-item') as HTMLElement;
            if (!item) return;
            this._activeGroup = item.dataset.group || null;
            this._render();
        });

        // Search input — cross-section filter. Empty query falls back to the
        // regular tab+sidebar browse flow.
        const searchInput = s.getElementById('search') as HTMLInputElement;
        searchInput.addEventListener('input', () => {
            this._query = searchInput.value;
            this._render();
        });

        // Hide chrome when locked so the user focuses on a single grid
        if (this._locked) {
            (s.getElementById('tabs') as HTMLElement).style.display = 'none';
            (s.querySelector('.groups-sidebar') as HTMLElement).style.display = 'none';
            (s.querySelector('.search-wrap') as HTMLElement).style.display = 'none';
        }

        // Set initial group — respect a forced category, otherwise pick the
        // first group of the current section.
        if (!this._activeGroup) {
            if (this._section === 'blocs') {
                const groups = Array.from(document.EditorManager.getObserver().getGroups());
                if (groups.length > 0) this._activeGroup = groups[0]!;
            }
            // For templates/snippets we'll pick the first group after fetch.
        }

        Promise.all([
            this._fetchTemplates(),
            this._fetchSnippets(),
            this._fetchBlocMeta(),
        ]).then(() => {
            // If a forced category is set but we're in a section whose groups
            // come from the fetched data, ensure we still target it even if
            // no template in that category exists yet (empty state handles it).
            if (this._forcedCategory) this._activeGroup = this._forcedCategory;
            this._render();
            this._dialog!.showModal();
            if (!this._locked) searchInput.focus();
        });
    }

    private async _fetchTemplates() {
        try {
            const res = await fetch(new URL("templates", document.EditorManager.getApiBasePath()));
            if (res.ok) this._templates = await res.json();
        } catch { /* ignore */ }
    }

    private async _fetchSnippets() {
        try {
            const res = await fetch(new URL("snippets", document.EditorManager.getApiBasePath()));
            if (res.ok) this._snippets = await res.json();
        } catch { /* ignore */ }
    }

    /**
     * The in-browser observer only carries tag/label/group for each bloc —
     * descriptions live in the DB. Merge them in via the lightweight
     * `/api/blocs-list` endpoint so cards can show a subtitle and search can
     * match against it.
     */
    private async _fetchBlocMeta() {
        try {
            const res = await fetch(new URL("blocs-list", document.EditorManager.getApiBasePath()));
            if (!res.ok) return;
            const list = await res.json() as BlocListEntry[];
            this._blocMeta = new Map(list.map(b => [b.id, { description: b.description }]));
        } catch { /* ignore */ }
    }

    private _render() {
        const searching = this._query.trim().length > 0 && !this._locked;
        this._renderTabs(searching);
        this._renderSidebar(searching);
        this._renderGrid(searching);
    }

    private _renderTabs(searching: boolean) {
        const tabs = this.shadowRoot!.querySelectorAll('.tab');
        tabs.forEach(tab => {
            const section = (tab as HTMLElement).dataset.section;
            tab.classList.toggle('active', !searching && section === this._section);
        });
    }

    private _renderSidebar(searching: boolean) {
        const sidebar = this.shadowRoot!.getElementById('sidebar')!;
        sidebar.innerHTML = '';
        // While searching, the grid shows cross-section results so the
        // per-group sidebar doesn't apply — hide it to free up width.
        (sidebar as HTMLElement).style.display = searching ? 'none' : '';
        if (searching) return;

        const groups = this._getGroups();

        if (this._activeGroup === null && groups.length > 0) {
            this._activeGroup = groups[0]!;
        }

        groups.forEach(group => {
            const btn = document.createElement('button');
            btn.className = `sidebar-item ${group === this._activeGroup ? 'active' : ''}`;
            btn.dataset.group = group;
            btn.textContent = group;
            sidebar.appendChild(btn);
        });
    }

    private _renderGrid(searching: boolean) {
        const grid = this.shadowRoot!.getElementById('grid')!;
        grid.innerHTML = '';

        const deps = { onInsert: (detail: InsertDetail) => this._emitInsert(detail) };

        if (searching) {
            const allBlocs = Array.from(document.EditorManager.getObserver().getItems());
            renderSearchResults(grid, this._query, allBlocs, this._blocMeta, this._templates, this._snippets, deps);
            return;
        }

        if (this._section === 'blocs') {
            if (!this._activeGroup) return;
            const items = Array.from(document.EditorManager.getObserver().getItemsByGroup(this._activeGroup));
            renderBlocSection(grid, items, this._blocMeta, deps);
        } else if (this._section === 'templates') {
            renderTemplateSection(grid, this._templates, this._activeGroup, deps);
        } else if (this._section === 'snippets') {
            renderSnippetSection(grid, this._snippets, this._activeGroup, deps);
        }
    }

    private _emitInsert(detail: InsertDetail) {
        this.dispatchEvent(new CustomEvent('insert', {
            detail,
            bubbles: true,
            composed: true,
        }));
        this.close();
    }

    private _getGroups(): string[] {
        if (this._section === 'blocs') {
            return Array.from(document.EditorManager.getObserver().getGroups());
        }
        if (this._section === 'templates') {
            return Array.from(new Set(this._templates.map(t => t.category || 'Default')));
        }
        if (this._section === 'snippets') {
            return Array.from(new Set(this._snippets.map(s => s.category || 'Default')));
        }
        return [];
    }

    public close() {
        this._dialog?.close();
        BlocLibrary.instance = null;
    }

    static open(options?: BlocLibraryOptions) {
        const menu = new BlocLibrary(options);
        document.body.appendChild(menu);
        BlocLibrary.instance = menu;
        return menu;
    }
}

if (!customElements.get("w13c-action-bar")) {
    customElements.define("w13c-action-bar", BlocLibrary);
}
