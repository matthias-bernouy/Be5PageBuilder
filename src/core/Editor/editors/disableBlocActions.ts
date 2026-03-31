

export function disableBlocActions(target: HTMLElement[] | HTMLElement) {
    const targets = Array.isArray(target) ? target : [target];
    targets.forEach(t => {
        t.setAttribute("data-disable-delete", "true");
        t.setAttribute("data-disable-edit", "true");
        t.setAttribute("data-disable-duplicate", "true");
        t.setAttribute("data-disable-add-before", "true");
        t.setAttribute("data-disable-add-after", "true");
        t.setAttribute("data-disable-save-as-template", "true");
    });
}