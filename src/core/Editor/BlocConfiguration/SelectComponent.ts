import type { Component } from "src/core/Utilities/Component";
import { PanelItem } from "./PanelItem";
import { BlocLibrary } from "../BlocLibrary/BlocLibrary";

export class SelectComponent extends PanelItem {
    private _components: Component[] = [];
    private _isMultiple: boolean = false;

    static override tagName = "p9r-select-component";

    constructor() {
        super();
    }

    public setMultiple(value: boolean) {
        this._isMultiple = value;
        this.render();
        return this; // Permet le chaînage
    }

    connectedCallback() {
        this.render();
    }

    private openSelector() {
        const actionbar = BlocLibrary.open();
        actionbar.addEventListener("insert", (e: any) => {
            const newComponent = document.createElement(e.detail.id) as Component;
            
            if (this._isMultiple) {
                this._components.push(newComponent);
            } else {
                this._components = [newComponent];
            }
            
            this.render();
        }, { once: true });
    }

    // Retourne un tableau en mode multiple, ou le premier élément sinon
    get value() {
        return this._isMultiple ? this._components : (this._components[0] || null);
    }

    render() {
        const hasSelection = this._components.length > 0;
        
        // Icône : Plus si vide ou multiple, Oeil si unique
        const icon = (!this._isMultiple && hasSelection)
            ? `<svg slot="icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
            : `<svg slot="icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

        const label = this._isMultiple 
            ? `Blocs : ${this._components.length} sélectionné(s)`
            : (hasSelection ? `Bloc : ${this._components[0]!._label || 'Configuré'}` : 'Sélectionner un bloc');

        const color = hasSelection ? "success" : "info";

        this.shadowRoot!.innerHTML = `
            <style>
                :host { display: block; width: 100%; font-family: sans-serif; }
                .container { display: flex; flex-direction: column; gap: 8px; }
                .trigger-wrapper { display: flex; gap: 8px; align-items: center; }
                p9r-button { flex: 1; }
                
                /* Liste des badges pour le mode multiple */
                .chips-list { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
                .chip { 
                    display: flex; align-items: center; gap: 6px;
                    background: var(--primary-muted); color: var(--primary-contrasted);
                    padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;
                    border: 1px solid var(--border-default);
                }
                .remove-chip { cursor: pointer; display: flex; opacity: 0.7; }
                .remove-chip:hover { opacity: 1; color: var(--danger-base); }
                
                .clear-btn { cursor: pointer; color: var(--text-muted); }
                .clear-btn:hover { color: var(--danger-base); }
            </style>

            <div class="container">
                <div class="trigger-wrapper">
                    <p9r-button fullwidth type="button" id="trigger" color="${color}" variant="outlined">
                        ${icon}
                        <span>${label}</span>
                    </p9r-button>
                    
                    ${(!this._isMultiple && hasSelection) ? `
                        <div id="clear-all" class="clear-btn" title="Délier">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </div>
                    ` : ''}
                </div>

                ${this._isMultiple && hasSelection ? `
                    <div class="chips-list">
                        ${this._components.map((comp, index) => `
                            <div class="chip">
                                <span>${comp._label || 'Bloc'}</span>
                                <span class="remove-chip" data-index="${index}">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        this.initEvents();
    }

    private initEvents() {
        // Clic sur le bouton principal
        this.shadowRoot?.querySelector('#trigger')?.addEventListener('click', () => {
            if (!this._isMultiple && this._components[0]) {
                this.focusComponent(this._components[0]);
            } else {
                this.openSelector();
            }
        });

        // Suppression unique (mode single)
        this.shadowRoot?.querySelector('#clear-all')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this._components = [];
            this.render();
        });

        // Suppression individuelle (mode multiple)
        this.shadowRoot?.querySelectorAll('.remove-chip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt((btn as HTMLElement).dataset.index!);
                this._components.splice(index, 1);
                this.render();
            });
        });
    }

    private focusComponent(comp: Component) {
        document.EditorManager.getBlocConfigPanel()?.close();
        comp.scrollIntoView({ behavior: 'smooth', block: 'center' });
        comp.focus();
    }
}

if ( !customElements.get("p9r-select-component") ){
    customElements.define("p9r-select-component", SelectComponent);
}