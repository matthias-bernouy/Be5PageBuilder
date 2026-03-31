export type ComponentMetadata = {
    css: string;
    template: string;
}

export abstract class Component extends HTMLElement {

    _label: string = "Default Label";
    _group: string = "Default Group";

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
}