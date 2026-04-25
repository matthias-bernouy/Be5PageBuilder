export async function waitForScripts(ele: HTMLElement) {
    const scriptSlot = ele.shadowRoot?.querySelector('slot[name="script"]') as HTMLSlotElement;
    const scripts = scriptSlot.assignedElements() as HTMLScriptElement[];
    
    const loaders = scripts.map(s => {
        if (s.src && !s.dataset.loaded) {
            return new Promise((resolve) => {
                s.onload = () => {
                    s.dataset.loaded = "true";
                    resolve(true);
                };
            });
        }
        return Promise.resolve(true);
    });
    
    await Promise.all(loaders);
}