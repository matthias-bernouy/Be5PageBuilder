

export function getFormData(formEle: HTMLFormElement, slotTarget: HTMLSlotElement) {
    const formData = new FormData(formEle);  // pas besoin du cast

    const elements = slotTarget?.assignedElements();
    if (!elements) return formData;  // garde

    for (const element of elements) {
        const name = element.getAttribute('name');
        const value = (element as any).value;  // value n'existe que sur certains éléments
        
        if (name && value !== undefined && value !== "") {
            formData.append(name, value);
        }

        // Recherche les inputs imbriqués (ex: si l'élément slotté est un wrapper)
        const nestedInputs = element.querySelectorAll<HTMLElement>('[name]');
        for ( const input of nestedInputs as any ){
            if ( !input.name || !input.value ) continue;
            formData.set(input.name, input.value);
        }
    }

    return formData;
}