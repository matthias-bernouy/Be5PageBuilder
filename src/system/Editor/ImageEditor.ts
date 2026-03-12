import { Editor } from "../base/Editor";

const cssStyle = `
    img:hover {
        opacity: 0.5;
    }
`

export class ImageEditor extends Editor {
    
    private mediaCenter;
    private onClick = () => this.handleClick();
    private onSelectMedia = (e: any) => this.handleSelectMedia(e);

    constructor(target: HTMLElement) {
        super(target, cssStyle);
        this.target.setAttribute("src", "https://picsum.photos/200");
        this.mediaCenter = document.EditorManager.getMediaCenter();
        this.viewEditor();
    }

    init() {
        this.target.removeEventListener("click", this.onClick);
        this.target.addEventListener("click", this.onClick);
    }

    private handleSelectMedia(e: any){
        this.target.setAttribute("src", e.detail.src);
        this.target.setAttribute("alt", e.detail.alt);
        this.mediaCenter.removeEventListener("select-image", this.onSelectMedia)
    }

    private handleClick() {
        this.mediaCenter.show();
        this.mediaCenter.addEventListener("select-image", this.onSelectMedia)
    }

    restore() {
        this.target.removeEventListener("click", this.onClick);
    }
}