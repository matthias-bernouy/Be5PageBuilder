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
    
    private onClick = () => this.handleClick();
    private onSelectMedia = (e: any) => this.handleSelectMedia(e);

    constructor(target: HTMLElement) {
        super(target, cssStyle);
        this.target.setAttribute("src", "https://picsum.photos/200");
        this.resizeInstance = new ResizeInstance(this.target, (w, h, top, left) => {
            this.target.style.width = `${w}px`;
            this.target.style.height = `${h}px`;
            if (top !== undefined) this.target.style.top = `${top}px`;
            if (left !== undefined) this.target.style.left = `${left}px`;
        });
    }

    init() {
        this.target.removeEventListener("click", this.onClick);
        this.target.addEventListener("click", this.onClick);
        this.resizeInstance.start();
    }

    private handleSelectMedia(e: any){
        this.target.setAttribute("src", e.detail.src);
        this.target.setAttribute("alt", e.detail.alt);
        document.EditorManager.getMediaCenter().removeEventListener("select-image", this.onSelectMedia)
    }

    private handleClick() {
        document.EditorManager.getMediaCenter().show();
        document.EditorManager.getMediaCenter().addEventListener("select-image", this.onSelectMedia)
    }

    restore() {
        this.target.removeEventListener("click", this.onClick);
        document.EditorManager.getMediaCenter().removeEventListener("select-image", this.onSelectMedia)
        this.resizeInstance.stop();
    }
}