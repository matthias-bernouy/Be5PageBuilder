if (typeof globalThis.HTMLElement === "undefined") {
    class HTMLElement { }
    (globalThis as any).HTMLElement = HTMLElement;
}

if (typeof globalThis.customElements === "undefined" ){
    (globalThis as any).customElements = {
        define: (tag: string, constructor: any) => {
        },
        get: (tag: string) => undefined,
    };
}

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