import { ActionBar } from "../Component/Actionbar/Actionbar";
import { Editor } from "../base/Editor";

const cssStyle = `
    img:hover {
        opacity: 0.5;
    }
`

export class ImageEditor extends Editor {
    
    private onClick = () => this.handleClick();

    constructor(target: HTMLElement) {
        super(target, cssStyle);

        this.target.setAttribute("src", "https://picsum.photos/200");
        this.viewEditor();
    }

    init() {
        this.target.removeEventListener("click", this.onClick);

        this.target.addEventListener("click", this.onClick);
    }

    private handleClick() {
    }

    restore() {
        this.target.removeEventListener("click", this.onClick);
    }
}