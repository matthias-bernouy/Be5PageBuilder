import { Component, type ComponentMetadata } from 'src/core/Utilities/Component';
import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import type { TagElement } from '../Base/ObserverManager';

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

    constructor() {
        super(ActionBarMetadata);
    }

    connectedCallback() {
        this.dialog = this.shadowRoot?.querySelector('#action-bar-dialog') as HTMLDialogElement;
        
        // Gestion de la fermeture native (touche Escape ou bouton close)
        this.dialog.addEventListener('close', () => this.remove());
        
        // Fermeture si on clique sur le backdrop (le fond gris)
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) this.close();
        });


        const observer = document.EditorManager.getObserver();
        const groups = Array.from(observer.getGroups());
        if (groups.length > 0) this.activeGroup = groups[0]!;

        this.renderExternalElements();
        this.dialog.showModal(); // Ouvre en mode modal natif
    }

    private renderExternalElements() {
        const observer = document.EditorManager.getObserver();
        const groups: string[] = Array.from(observer.getGroups());
        const gridBlocs = this.shadowRoot!.querySelector("main")!;

        gridBlocs.innerHTML = '';
        this.innerHTML = '';

        groups.forEach(groupName => {
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

        // Rendu des blocs
        if (this.activeGroup) {
            const items = observer.getItemsByGroup(this.activeGroup);
            console.log(items)
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
                        detail: { id: item.tag }, 
                        bubbles: true, 
                        composed: true 
                    }));
                    this.close();
                };
                gridBlocs.appendChild(card);
            });
        }
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

customElements.define("w13c-action-bar", BlocLibrary);