const DRAG_PILL_WIDTH = 180;
const DRAG_PILL_HEIGHT = 32;

export class DragManager {
    private draggedElement: HTMLElement | null = null;
    private _ghost: HTMLElement | null = null;

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
            // The native drag image mirrors the element at its real size —
            // unusable for a full-bleed hero. Force a compact fixed-size ghost.
            this._setGhostImage(e, this.draggedElement);
            this.draggedElement.classList.add("dragging");
            document.EditorManager?.getBlocActionGroup()?.close();
            (document.querySelector("w13c-editor-toolbar") as any)?.hide?.();
        }
    }

    private _setGhostImage(e: DragEvent, source: HTMLElement) {
        if (!e.dataTransfer) return;

        // A compact pill — discrete, always readable, independent of the
        // source's size. The cloned-scaled approach fails for full-bleed
        // heroes (scale ~0.05 destroys every detail) and for blocs with
        // lazy-loaded content (images / fonts / shadow DOM children).
        const ghost = document.createElement("div");
        ghost.className = "p9r-drag-ghost";
        Object.assign(ghost.style, {
            position: "fixed",
            top: "-9999px",
            left: "-9999px",
            width: `${DRAG_PILL_WIDTH}px`,
            height: `${DRAG_PILL_HEIGHT}px`,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "0 12px",
            boxSizing: "border-box",
            background: "rgba(30, 41, 59, 0.95)",
            color: "#fff",
            border: "1px solid rgba(67, 97, 238, 0.8)",
            borderRadius: "999px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "12px",
            fontWeight: "600",
            lineHeight: "1",
            pointerEvents: "none",
            overflow: "hidden",
            whiteSpace: "nowrap",
        } as Partial<CSSStyleDeclaration>);

        ghost.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round"
                 style="flex-shrink:0;opacity:0.8">
                <circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/>
                <circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/>
            </svg>
            <span style="overflow:hidden;text-overflow:ellipsis"></span>
        `;
        ghost.querySelector("span")!.textContent = this._pillLabel(source);

        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 16, DRAG_PILL_HEIGHT / 2);
        this._ghost = ghost;
    }

    private _pillLabel(el: HTMLElement): string {
        return `<${el.tagName.toLowerCase()}>`;
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
        this._ghost?.remove();
        this._ghost = null;
        if (!this.draggedElement) return;
        this.draggedElement.classList.remove("dragging");
    }
}