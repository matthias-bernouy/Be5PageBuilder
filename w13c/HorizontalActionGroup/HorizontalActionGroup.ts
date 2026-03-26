import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from 'src/core/Utilities/Component';

export class HorizontalActionGroup extends Component {

    static _event = "action-click";

    constructor() {
        super({
            css,
            template: template as unknown as string
        });
    }

    connectedCallback() {
        const elements = this.querySelectorAll("[data-action]")!;
        elements.forEach(actionItem => {
            actionItem.addEventListener('click', (e: Event) => {
                e.stopPropagation();
                const actionName = actionItem.getAttribute('data-action');
                this.dispatchAction(actionName, actionItem);
            });
        });
    }

    private dispatchAction(name: string | null, element: Element) {
        this.dispatchEvent(new CustomEvent('action-click', {
            detail: {
                action: name,
                originalEvent: event,
                target: element
            },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define("p9r-horizontal-action-group", HorizontalActionGroup);