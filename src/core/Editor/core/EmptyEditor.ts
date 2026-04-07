import { Editor } from "./Editor";

export class EmptyEditor extends Editor {
    constructor(target: HTMLElement) {
        super(target, "");
    }

    init() {
    }

    restore() {
    } 
}