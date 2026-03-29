import { Editor } from "../Base/Editor";
import { ResizeInstance } from "../Base/ResizeInstance";

const cssStyle = `
    img:hover {
        opacity: 0.5;
        cursor: nwse-resize;
    }
`

export class ImageEditor extends Editor {

    private resizeInstance: ResizeInstance;

    private onClick = (e) => this.handleClick(e);
    private onSelectMedia = (e: any) => this.handleSelectMedia(e);

    constructor(target: HTMLElement) {
        super(target, cssStyle);
        if (!this.target.getAttribute("src")) this.target.setAttribute("src", "https://picsum.photos/200");
        this.resizeInstance = new ResizeInstance(this.target, (w, h) => {
            this.target.style.width = `${w}px`;
            this.target.style.height = `${h}px`;
        });
    }

    init() {
        this.target.removeEventListener("click", this.onClick);
        this.target.addEventListener("click", this.onClick);
        this.resizeInstance.start();
    }

    private handleSelectMedia(e: any) {
        this.target.setAttribute("src", e.detail.src);
        this.target.setAttribute("alt", e.detail.alt);
        document.EditorManager.getMediaCenter().removeEventListener("select-item", this.onSelectMedia)
    }

    private handleClick(e: MouseEvent) {
        e.preventDefault();
        e.stopImmediatePropagation();

        const mediaCenter = document.EditorManager.getMediaCenter();

        mediaCenter.removeEventListener("select-item", this.onSelectMedia);
        mediaCenter.addEventListener("select-item", this.onSelectMedia);

        mediaCenter.show(["folder", "image"]);
    }

    restore() {
        this.target.removeEventListener("click", this.onClick);
        document.EditorManager.getMediaCenter().removeEventListener("select-item", this.onSelectMedia)
        this.resizeInstance.stop();
    }
}