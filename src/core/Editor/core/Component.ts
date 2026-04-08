export type ComponentMetadata = {
    css: string;
    template: string;
}

export abstract class Component extends HTMLElement {

    constructor(metadata?: ComponentMetadata) {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        if (metadata){
            const template = document.createElement('template');
            template.innerHTML = `
                <style>${metadata.css}</style>
                ${metadata.template}
            `;
            shadow.appendChild(template.content.cloneNode(true));
        }
    }

    connectedCallback() {
    }


}