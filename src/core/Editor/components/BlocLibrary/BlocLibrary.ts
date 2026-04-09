import { Component, type ComponentMetadata } from 'src/core/Editor/core/Component';
import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import type { TagElement } from '../../core/ObserverManager';

const TEMPLATE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w13c-icon-svg" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
    <path d="M3 9h18" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M9 21V9" stroke="currentColor" stroke-width="1.5" fill="none"/>
</svg>
`;

const SNIPPET_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w13c-icon-svg" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m18 16 4-4-4-4"/>
    <path d="m6 8-4 4 4 4"/>
    <path d="m14.5 4-5 16"/>
</svg>
`;

const DEFAULT_COMPONENT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w13c-icon-svg" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="6" y="6" width="12" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>
    <rect x="6" y="14" width="5" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="13" y="14" width="5" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>
`;

type Section = 'blocs' | 'templates' | 'snippets';
type TemplateItem = { id: string; name: string; content: string; category: string };
type SnippetItem = { id: string; identifier: string; name: string; category: string };

export const ActionBarMetadata: ComponentMetadata = {
    css: css,
    template: html as unknown as string
}

export class BlocLibrary extends Component {
    private static instance: BlocLibrary | null = null;
    private _dialog: HTMLDialogElement | null = null;
    private _section: Section = 'blocs';
    private _activeGroup: string | null = null;
    private _templates: TemplateItem[] = [];
    private _snippets: SnippetItem[] = [];

    constructor() {
        super(ActionBarMetadata);
    }

    connectedCallback() {
        const s = this.shadowRoot!;
        this._dialog = s.querySelector('#action-bar-dialog') as HTMLDialogElement;

        this._dialog.addEventListener('close', () => this.remove());
        this._dialog.addEventListener('click', (e) => {
            if (e.target === this._dialog) this.close();
        });

        // Tab clicks
        s.getElementById('tabs')!.addEventListener('click', (e) => {
            const tab = (e.target as HTMLElement).closest('.tab:not(.disabled)') as HTMLElement;
            if (!tab) return;
            this._section = tab.dataset.section as Section;
            this._activeGroup = null;
            this._render();
        });

        // Sidebar clicks
        s.getElementById('sidebar')!.addEventListener('click', (e) => {
            const item = (e.target as HTMLElement).closest('.sidebar-item') as HTMLElement;
            if (!item) return;
            this._activeGroup = item.dataset.group || null;
            this._render();
        });

        // Set initial group
        const observer = document.EditorManager.getObserver();
        const groups = Array.from(observer.getGroups());
        if (groups.length > 0) this._activeGroup = groups[0]!;

        Promise.all([this._fetchTemplates(), this._fetchSnippets()]).then(() => {
            this._render();
            this._dialog!.showModal();
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

    private _render() {
        this._renderTabs();
        this._renderSidebar();
        this._renderGrid();
    }

    private _renderTabs() {
        const tabs = this.shadowRoot!.querySelectorAll('.tab');
        tabs.forEach(tab => {
            const section = (tab as HTMLElement).dataset.section;
            tab.classList.toggle('active', section === this._section);
        });
    }

    private _renderSidebar() {
        const sidebar = this.shadowRoot!.getElementById('sidebar')!;
        sidebar.innerHTML = '';

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

    private _renderGrid() {
        const grid = this.shadowRoot!.getElementById('grid')!;
        grid.innerHTML = '';

        if (this._section === 'blocs') {
            this._renderBlocCards(grid);
        } else if (this._section === 'templates') {
            this._renderTemplateCards(grid);
        } else if (this._section === 'snippets') {
            this._renderSnippetCards(grid);
        }
    }

    private _getGroups(): string[] {
        if (this._section === 'blocs') {
            return Array.from(document.EditorManager.getObserver().getGroups());
        }
        if (this._section === 'templates') {
            const cats = new Set(this._templates.map(t => t.category || 'Default'));
            return Array.from(cats);
        }
        if (this._section === 'snippets') {
            const cats = new Set(this._snippets.map(s => s.category || 'Default'));
            return Array.from(cats);
        }
        return [];
    }

    private _renderBlocCards(grid: HTMLElement) {
        if (!this._activeGroup) return;
        const observer = document.EditorManager.getObserver();
        const items = observer.getItemsByGroup(this._activeGroup);

        items.forEach((item: TagElement) => {
            const card = this._createCard(DEFAULT_COMPONENT_SVG, item.label, () => {
                this.dispatchEvent(new CustomEvent('insert', {
                    detail: { id: item.tag, type: 'bloc' },
                    bubbles: true,
                    composed: true
                }));
                this.close();
            });
            grid.appendChild(card);
        });
    }

    private _renderTemplateCards(grid: HTMLElement) {
        const filtered = this._templates.filter(t =>
            (t.category || 'Default') === this._activeGroup
        );

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                    <p>No templates in this category</p>
                </div>
            `;
            return;
        }

        filtered.forEach(tpl => {
            const card = this._createCard(TEMPLATE_SVG, tpl.name, () => {
                this.dispatchEvent(new CustomEvent('insert', {
                    detail: { type: 'template', html: tpl.content },
                    bubbles: true,
                    composed: true
                }));
                this.close();
            });
            grid.appendChild(card);
        });
    }

    private _renderSnippetCards(grid: HTMLElement) {
        const filtered = this._snippets.filter(s =>
            (s.category || 'Default') === this._activeGroup
        );

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                    <p>No snippets in this category</p>
                </div>
            `;
            return;
        }

        filtered.forEach(snippet => {
            const card = this._createCard(SNIPPET_SVG, snippet.name, () => {
                this.dispatchEvent(new CustomEvent('insert', {
                    detail: { type: 'snippet', identifier: snippet.identifier },
                    bubbles: true,
                    composed: true
                }));
                this.close();
            });
            grid.appendChild(card);
        });
    }

    private _createCard(icon: string, label: string, onClick: () => void): HTMLButtonElement {
        const card = document.createElement('button');
        card.className = 'card';
        card.innerHTML = `
            <span class="icon">${icon}</span>
            <span class="title">${label}</span>
        `;
        card.onclick = onClick;
        return card;
    }

    public close() {
        this._dialog?.close();
        BlocLibrary.instance = null;
    }

    static open() {
        const menu = new BlocLibrary();
        document.body.appendChild(menu);
        BlocLibrary.instance = menu;
        return menu;
    }
}

if (!customElements.get("w13c-action-bar")) {
    customElements.define("w13c-action-bar", BlocLibrary);
}
