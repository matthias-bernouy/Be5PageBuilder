import { FooterMenu } from "./component";

export function registerFooterMenu(parentTag: string) {
    const childTag = parentTag + "-menu";
    if (!customElements.get(childTag)) {
        customElements.define(childTag, FooterMenu);
    }
}
