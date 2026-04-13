export class DragManager {
    private draggedElement: HTMLElement | null = null;

    constructor(container: HTMLElement) {
        container.addEventListener("dragstart", (e) => this.handleDragStart(e));
        container.addEventListener("dragover", (e) => this.handleDragOver(e));
        container.addEventListener("drop", (e) => this.handleDrop(e));
        container.addEventListener("dragend", () => this.handleDragEnd());
    }

    private handleDragStart(e: DragEvent) {
        this.draggedElement = (e.target as HTMLElement).closest(".editor-block");
        if (this.draggedElement) {
            e.dataTransfer?.setData("text/plain", "");
            this.draggedElement.classList.add("dragging");
            document.EditorManager?.getBlocActionGroup()?.close();
            (document.querySelector("w13c-editor-toolbar") as any)?.hide?.();
        }
    }

    private handleDragOver(e: DragEvent) {
        e.preventDefault();
        if (!this.draggedElement) return;

        const target = (e.target as HTMLElement).closest(".editor-block") as HTMLElement;

        if (target && target !== this.draggedElement) {
            // Skip ancestors — prevents the glitch where closest() matches
            // the parent component and the element jumps between levels
            if (target.contains(this.draggedElement)) return;

            const rect = target.getBoundingClientRect();
            const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;

            // Match destination slot
            this._matchSlot(target.getAttribute("slot"));

            target.parentElement?.insertBefore(this.draggedElement, next ? target.nextSibling : target);
        } else if (!target) {
            // Cursor over empty slot area — walk composedPath to find a <slot>
            const slotName = this._slotFromComposedPath(e);
            if (slotName !== undefined) {
                this._matchSlot(slotName);
                this.draggedElement.parentElement?.appendChild(this.draggedElement);
            }
        }
    }

    private handleDrop(e: DragEvent) {
        e.preventDefault();
        this._finalize();
    }

    private handleDragEnd() {
        this._finalize();
        this.draggedElement = null;
    }

    /** Update the dragged element's slot attribute to match the destination. */
    private _matchSlot(slotName: string | null) {
        if (!this.draggedElement) return;
        const current = this.draggedElement.getAttribute("slot");
        if (slotName === current) return;

        if (slotName) {
            this.draggedElement.setAttribute("slot", slotName);
        } else {
            this.draggedElement.removeAttribute("slot");
        }
    }

    /**
     * Walk the event's composed path (crosses shadow boundaries) looking for
     * a `<slot>` element. Returns the slot name (string), `null` for the
     * default slot, or `undefined` if no slot was found in the path.
     */
    private _slotFromComposedPath(e: DragEvent): string | null | undefined {
        for (const el of e.composedPath()) {
            if (el instanceof HTMLSlotElement) {
                return el.name || null;
            }
        }
        return undefined;
    }

    private _finalize() {
        if (!this.draggedElement) return;
        this.draggedElement.classList.remove("dragging");
    }
}