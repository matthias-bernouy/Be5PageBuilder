import { HorizontalMenuItem } from "./component";

export function registerHorizontalMenuItem(parent: string){
    const tag = parent + "-item";
    if (!customElements.get(tag)) {
        customElements.define(tag, HorizontalMenuItem);
    }
}