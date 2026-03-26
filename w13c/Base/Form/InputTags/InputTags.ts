import { Component } from "src/core/Utilities/Component";
import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

// On s'assure que Input est chargé
import "../Input/Input"; 
import "w13c/Base/Tag/Tag";

export class InputTags extends Component {
    static formAssociated = true;
    
    private _internals: ElementInternals;
    private _tags: string[] = [];
    private _inputComponent: any = null; // Ton composant w13c-input
    private _display: HTMLElement | null = null;

    constructor() {
        super({
            css,
            template: template as unknown as string
        });
        this._internals = this.attachInternals();
    }

    connectedCallback() {
        this._inputComponent = this.shadowRoot?.querySelector('#main-input');
        this._display = this.shadowRoot?.querySelector('#tags-display') || null;

        // On écoute le "keydown" sur le composant input
        this._inputComponent?.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this._addTagFromInput();
            } else if (e.key === 'Backspace' && this._inputComponent.value === "") {
                this._removeLastTag();
            }
        });
    }

    private _addTagFromInput() {
        const val = this._inputComponent.value.trim();
        if (val && !this._tags.includes(val)) {
            this._tags.push(val);
            this._inputComponent.value = ""; // On vide l'input
            this._update();
        }
    }

    private _removeLastTag() {
        if (this._tags.length > 0) {
            this._tags.pop();
            this._update();
        }
    }

    private _update() {
        this._renderTags();
        // C'est cette valeur qui sera envoyée lors du submit du formulaire
        this._internals.setFormValue(this.value);
        
        this.dispatchEvent(new CustomEvent('change', { 
            detail: { tags: this._tags, raw: this.value } 
        }));
    }

    private _renderTags() {
        if (!this._display) return;
        this._display.innerHTML = '';
        
        this._tags.forEach((tag, index) => {
            const tagEl = document.createElement('p9r-tag');
            tagEl.textContent = tag;
            tagEl.onclick = () => {
                this._tags.splice(index, 1);
                this._update();
            };
            this._display?.appendChild(tagEl);
        });
    }

    // --- API Formulaire ---
    get value() { return this._tags.join(','); }
    set value(v: string) {
        this._tags = v ? v.split(',').filter(t => t !== "") : [];
        this._update();
    }

    get name() { return this.getAttribute('name') || ""; }
}

if (!customElements.get("w13c-tag-input")) {
    customElements.define("w13c-tag-input", InputTags);
}