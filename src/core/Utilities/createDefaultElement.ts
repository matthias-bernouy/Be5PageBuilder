

export function createDefaultElement(
    element: HTMLElement, 
    targetSlot: string, 
    tag: keyof HTMLElementTagNameMap = "p",
    text?: string
)
{
    const currentElement = element.querySelector(`[slot=${targetSlot}]`)
    if (currentElement) return currentElement as HTMLElement;

    const defaultElement = document.createElement(tag);
    defaultElement.setAttribute("slot", targetSlot);
    if (text) defaultElement.innerText = text;

    element.append(defaultElement);
    return defaultElement as HTMLElement;
}