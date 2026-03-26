export type ComponentMetadata = {
    css: string;
    template: string;
}

export abstract class Component extends HTMLElement {

    constructor(metadata: ComponentMetadata) {
        super();
        this.attachShadow({ mode: 'open' });
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = `
                <style>${metadata.css}</style>
                ${metadata.template}
            `;
        }
    }

}