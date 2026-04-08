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

const DEFAULT_COMPONENT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w13c-icon-svg" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="6" y="6" width="12" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>
    <rect x="6" y="14" width="5" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="13" y="14" width="5" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>
`;

export const ActionBarMetadata: ComponentMetadata = {
    css: css,
    template: html as unknown as string
}

export class BlocLibrary extends Component {
    private static instance: BlocLibrary | null = null;
    private activeGroup: string | null = null;
    private dialog: HTMLDialogElement | null = null;
    private _templates: { id: string; name: string; content: string; category: string }[] = [];

    constructor() {
        super(ActionBarMetadata);
    }

    connectedCallback() {
        this.dialog = this.shadowRoot?.querySelector('#action-bar-dialog') as HTMLDialogElement;

        // Close on native dialog close (Escape key or close button)
        this.dialog.addEventListener('close', () => this.remove());

        // Close on backdrop click
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) this.close();
        });

        const observer = document.EditorManager.getObserver();
        const groups = Array.from(observer.getGroups());
        if (groups.length > 0) this.activeGroup = groups[0]!;

        this._fetchTemplates().then(() => {
            this.renderExternalElements();
            this.dialog!.showModal();
        });
    }

    private async _fetchTemplates() {
        try {
            const res = await fetch(new URL("templates", document.EditorManager.getApiBasePath()));
            console.log(res);
            if (res.ok) this._templates = await res.json();
        } catch (e) { console.log(e) }
    }

    private renderExternalElements() {
        const observer = document.EditorManager.getObserver();
        const groups: string[] = Array.from(observer.getGroups());
        const gridBlocs = this.shadowRoot!.querySelector("main")!;

        // Add "Templates" group if we have templates
        const hasTemplates = this._templates.length > 0;
        const allGroups = hasTemplates ? [...groups, "Templates"] : groups;

        gridBlocs.innerHTML = '';
        this.innerHTML = '';

        allGroups.forEach(groupName => {
            const btn = document.createElement('button');
            btn.slot = 'group';
            btn.className = `group-item ${groupName === this.activeGroup ? 'active' : ''}`;
            btn.textContent = groupName;
            btn.onclick = () => {
                this.activeGroup = groupName;
                this.renderExternalElements();
            };
            this.appendChild(btn);
        });

        if (this.activeGroup === "Templates") {
            this._renderTemplates(gridBlocs);
        } else if (this.activeGroup) {
            const items = observer.getItemsByGroup(this.activeGroup);
            items.forEach((item: TagElement) => {
                const card = document.createElement('button');
                card.slot = 'bloc';
                card.className = 'card';
                card.innerHTML = `
                    <span class="icon">${DEFAULT_COMPONENT_SVG}</span>
                    <span class="title">${item.label}</span>
                `;
                card.onclick = () => {
                    this.dispatchEvent(new CustomEvent('insert', {
                        detail: { id: item.tag, type: 'bloc' },
                        bubbles: true,
                        composed: true
                    }));
                    this.close();
                };
                gridBlocs.appendChild(card);
            });
        }
    }

    private _renderTemplates(grid: HTMLElement) {
        this._templates.forEach(tpl => {
            const card = document.createElement('button');
            card.slot = 'bloc';
            card.className = 'card';
            card.innerHTML = `
                <span class="icon">${TEMPLATE_SVG}</span>
                <span class="title">${tpl.name}</span>
            `;
            card.onclick = () => {
                this.dispatchEvent(new CustomEvent('insert', {
                    detail: { type: 'template', html: tpl.content },
                    bubbles: true,
                    composed: true
                }));
                this.close();
            };
            grid.appendChild(card);
        });
    }

    public close() {
        this.dialog?.close();
        BlocLibrary.instance = null;
    }

    static open() {
        const menu = new BlocLibrary();
        document.body.appendChild(menu);
        BlocLibrary.instance = menu;
        return menu;
    }
}

if ( !customElements.get("w13c-action-bar") ){
    customElements.define("w13c-action-bar", BlocLibrary);
}