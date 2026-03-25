import { Component } from "../../../Utilities/Component";
import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };

export class MediaCenter extends Component {

    private imgContainer;
    private dialog;

    constructor() {
        super({
            css: css as unknown as string,
            template: html as unknown as string
        });
        this.dialog = this.shadowRoot?.querySelector("dialog");
        this.imgContainer = this.shadowRoot?.getElementById("imgContainer");
    }

    private handleClickImage = (e: Event) => {
        const img = e.target! as HTMLImageElement;
        this.dispatchEvent(new CustomEvent("select-image", {
            detail: {
                src: img.src,
                alt: img.alt
            },
            bubbles: true,
            composed: true
        }))
        this.dialog?.close();
    }

    show(){
        this.clearImages();
        this.dialog?.showModal();
    }

    clearImages(){
        const imgs = this.imgContainer?.querySelectorAll("img");
        if (imgs)[
            imgs.forEach((ele) => {
                ele.removeEventListener("click", this.handleClickImage)
                ele.remove();
            })
        ]
    }

    addImage(src: string, alt: string){
        const img = document.createElement("img");
        img.src = src;
        img.alt = alt;
        img.addEventListener("click", this.handleClickImage)
        this.imgContainer?.append(img);
    }

}

customElements.define("w13c-mediacenter", MediaCenter)