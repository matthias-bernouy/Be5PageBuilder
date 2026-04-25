import { Component, type ComponentMetadata } from 'src/control/core/editorSystem/Component';
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
import { getMetaApiPath } from 'src/control/core/dom/getMetaApiPath';
import getClosestEditorSystem from 'src/control/core/dom/getClosestEditorSystem';

type Section = 'blocs' | 'templates' | 'snippets';

export type BlocLibraryOptions = {
    section?: Section;
    category?: string;
    locked?: boolean;
};

export const ActionBarMetadata: ComponentMetadata = {
    css: css,
    template: html as unknown as string
}

type BlocListEntry = { id: string; name: string; group: string; description: string };

export class BlocLibrary extends Component {

    private _dialog: HTMLDialogElement | null = null;
    private _section: Section = 'blocs';
    private _activeGroup: string | null = null;
    private _templates: TemplateItem[] = [];
    private _snippets: SnippetItem[] = [];
    private _blocMeta: Map<string, BlocMeta> = new Map();
    private _locked: boolean = false;
    private _forcedCategory: string | null = null;
    private _query: string = '';

    constructor() {
        super(ActionBarMetadata);
    }

    override connectedCallback() {
        const editorManager = getClosestEditorSystem(this);
        const s = this.shadowRoot!;
        this._dialog = s.querySelector('#action-bar-dialog') as HTMLDialogElement;

        this._dialog.addEventListener('click', (e) => {
            if (e.target === this._dialog) this.close();
        });

        s.getElementById('tabs')!.addEventListener('click', (e) => {
            if (this._locked) return;
            const tab = (e.target as HTMLElement).closest('.tab:not(.disabled)') as HTMLElement;
            if (!tab) return;
            this._section = tab.dataset.section as Section;
            this._activeGroup = null;
            this._render();
        });

        s.getElementById('sidebar')!.addEventListener('click', (e) => {
            if (this._locked) return;
            const item = (e.target as HTMLElement).closest('.sidebar-item') as HTMLElement;
            if (!item) return;
            this._activeGroup = item.dataset.group || null;
            this._render();
        });

        const searchInput = s.getElementById('search') as HTMLInputElement;
        searchInput.addEventListener('input', () => {
            this._query = searchInput.value;
            this._render();
        });

        if (this._locked) {
            (s.getElementById('tabs') as HTMLElement).style.display = 'none';
            (s.querySelector('.groups-sidebar') as HTMLElement).style.display = 'none';
            (s.querySelector('.search-wrap') as HTMLElement).style.display = 'none';
        }
        if (!this._activeGroup) {
            if (this._section === 'blocs') {
                const groups = Array.from(editorManager.observer.getGroups());
                if (groups.length > 0) this._activeGroup = groups[0]!;
            }
        }

        Promise.all([
            this._fetchTemplates(),
            this._fetchSnippets(),
            this._fetchBlocMeta(),
        ]).then(() => {
            if (this._forcedCategory) this._activeGroup = this._forcedCategory;
            this._render();
            if (!this._locked) searchInput.focus();
        });
    }

    private async _fetchTemplates() {
        try {
            const res = await fetch(new URL("template/list", getMetaApiPath()));
            if (res.ok) this._templates = await res.json();
        } catch { /* ignore */ }
    }

    private async _fetchSnippets() {
        try {
            const res = await fetch(new URL("snippet/list", getMetaApiPath()));
            if (res.ok) this._snippets = await res.json();
        } catch { /* ignore */ }
    }

    private async _fetchBlocMeta() {
        try {
            const res = await fetch(new URL("bloc/list", getMetaApiPath()));
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
        const editorManager = getClosestEditorSystem(this);

        const grid = this.shadowRoot!.getElementById('grid')!;
        grid.innerHTML = '';

        const deps = { onInsert: (detail: InsertDetail) => this._emitInsert(detail) };

        if (searching) {
            const allBlocs = Array.from(editorManager.observer.getItems());
            renderSearchResults(grid, this._query, allBlocs, this._blocMeta, this._templates, this._snippets, deps);
            return;
        }

        if (this._section === 'blocs') {
            if (!this._activeGroup) return;
            const items = Array.from(editorManager.observer.getItemsByGroup(this._activeGroup));
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
        const editorManager = getClosestEditorSystem(this);
        if (this._section === 'blocs') {
            return Array.from(editorManager.observer.getGroups());
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
    }

    open() {
        this._dialog?.showModal();
    }
}

if (!customElements.get("cms-bloc-library")) {
    customElements.define("cms-bloc-library", BlocLibrary);
}
