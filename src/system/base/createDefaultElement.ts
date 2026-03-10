

export function createDefaultElement(
    element: HTMLElement, 
    targetSlot: string, tag: 
    keyof HTMLElementTagNameMap = "p", 
    text?: string
)
{
    const currentElement = element.querySelector(`[slot=${targetSlot}]`)
    if (currentElement) return currentElement;

    const defaultElement = document.createElement(tag);
    defaultElement.setAttribute("slot", targetSlot);

    element.append(defaultElement);
    return defaultElement;
}