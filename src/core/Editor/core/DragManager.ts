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
        }
    }

    private handleDragOver(e: DragEvent) {
        e.preventDefault();
        const target = (e.target as HTMLElement).closest(".editor-block") as HTMLElement;
        
        if (target && target !== this.draggedElement) {
            const rect = target.getBoundingClientRect();
            const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
            
            target.parentElement?.insertBefore(this.draggedElement!, next ? target.nextSibling : target);
        }
    }

    private handleDrop(e: DragEvent) {
        e.preventDefault();
        this.draggedElement?.classList.remove("dragging");
    }

    private handleDragEnd() {
        this.draggedElement?.classList.remove("dragging");
        this.draggedElement = null;
    }
}