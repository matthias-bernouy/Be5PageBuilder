import type { Component } from "src/core/Component/core/Component";
import { BlocLibrary } from "../components/BlocLibrary/BlocLibrary";
import { disableBlocActions } from "src/Be5System/disableBlocActions";
import { ConfigItem } from "./ConfigItem";

export class ComponentConfigItem extends ConfigItem {

    private _value: Component[] = [];
    private _isMultiple: boolean = false;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this._isMultiple = this.hasAttribute('data-multiple') || this.getAttribute('data-type') === 'array';
        this.init();
        this.render();
    }

    render() {
        this.shadowRoot!.innerHTML = `
            <style>
                :host { display: block; width: 100%; font-family: sans-serif; }
                .container { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
                .trigger-wrapper { display: flex; gap: 8px; align-items: center; }
                p9r-button { flex: 1; }

                .chips-list { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
                .chip {
                    display: flex; align-items: center; gap: 6px;
                    background: var(--primary-muted, #e0e7ff); color: var(--primary-contrasted, #3730a3);
                    padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;
                    border: 1px solid var(--border-default, #c7d2fe);
                }
                .remove-chip { cursor: pointer; display: flex; opacity: 0.7; }
                .remove-chip:hover { opacity: 1; color: var(--danger-base, #ef4444); }

                .clear-btn { cursor: pointer; color: var(--text-muted, #6b7280); display: flex; align-items: center; padding: 4px; }
                .clear-btn:hover { color: var(--danger-base, #ef4444); }
            </style>

            <div class="container">
                    ${this._value.map((component) => `
                            <p9r-button fullwidth type="button" class="BlocView" color="success" variant="outlined">
                                <svg slot="icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                                <span>Bloc: ${component.tagName}</span>
                            </p9r-button>
                        `
                    ).join('\n')}
                    ${(this._isMultiple || this._value.length === 0) 
                        ? `
                        <p9r-button fullwidth type="button" color="info" variant="outlined" id="BlocSelector">
                            <svg slot="icon-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            <span>Bloc selector</span>
                        </p9r-button>
                        ` 
                        : ''
                    }
            </div>
        `;

        this.initEvents();
    }

    private initEvents() {
        this.shadowRoot?.querySelector('#BlocSelector')?.addEventListener('click', () => {
            this.openSelector();
        });

        this.shadowRoot?.querySelectorAll(".BlocView").forEach((val, key) => {
            val.addEventListener("click", () => {
                document.EditorManager.getBlocConfigPanel().close();
                this._value[key]?.focus();
            })
        })
    }

    private openSelector() {
        const library = BlocLibrary.open();
        library.addEventListener("insert", (e: any) => {
            const id = e.detail.id;
            const element = document.createElement(id) as Component;
            const identifier = this.getAttribute('data-component-identifier');
            const slotName   = this.getAttribute('data-slot-name');
            if (slotName) element.setAttribute("slot", slotName);
            const component = document.querySelector(`[data-identifier="${identifier}"]`) as Component;
            if ( !this._isMultiple ){
                const currentElement = component.querySelector(`[slot=${slotName}]`);
                currentElement?.remove()
            }
            disableBlocActions(element)
            component.append(element);
            this.value = [...this.value, element];
        })
    }

    init() {
        const identifier = this.getAttribute('data-component-identifier');
        const slotName = this.getAttribute('data-slot-name');
        const defaultElement = this.querySelector("*");

        if (!identifier || !defaultElement || !slotName) return;

        const component = document.querySelector(`[data-identifier="${identifier}"]`) as Component;
        if (!component) return;

        let elements = Array.from(component.querySelectorAll(`[slot="${slotName}"]`)) as Component[];

        if (elements.length === 0) {
            const newElement = defaultElement.cloneNode(true) as Component;
            newElement.setAttribute("slot", slotName);
            component.append(newElement); 
            elements = [newElement];
        }
        this.value = elements;
    }

    onEditorMode = () => {
        this._value.forEach((ele) => {
            disableBlocActions(ele);
        })
    }

    set value(val: Component[]) {
        if (this._value === val) return;
        this._value = val;

        this.render();

        this.dispatchEvent(new CustomEvent('p9r-configuration-changed', {
            detail: {
                value: val,
                key: this.getAttribute("data-key")
            },
            bubbles: true,
            composed: true
        }));
    }

    get value() {
        return this._value;
    }
}

if ( !customElements.get("p9r-panel-component-item") ){
    customElements.define('p9r-panel-component-item', ComponentConfigItem);
}