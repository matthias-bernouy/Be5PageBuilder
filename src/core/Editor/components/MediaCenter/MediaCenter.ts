import html from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from 'src/core/Component/core/Component';
import type { MediaItem } from 'src/interfaces/contract/Media/MediaRepository';

export class MediaCenter extends Component {
    private imgContainer: HTMLElement | null | undefined;
    private dialog: HTMLDialogElement | null | undefined;
    private currentParentId: string | null = null;
    private selectedItem: MediaItem | null = null;
    private types: string[] = [];

    constructor() {
        super({
            css: css as unknown as string,
            template: html as unknown as string
        });
        this.dialog = this.shadowRoot?.querySelector("dialog");
        this.imgContainer = this.shadowRoot?.getElementById("imgContainer");

        this.initEventListeners();
    }

    private initEventListeners() {
        this.shadowRoot?.getElementById("btnCreateFolder")?.addEventListener("click", () => this.handleCreateFolder());
        this.shadowRoot?.getElementById("idUploadTrigger")?.addEventListener("click", () => this.handleUploadClick());
        this.shadowRoot?.getElementById("confirm-selection")?.addEventListener("click", () => this.confirmSelection());
        this.shadowRoot?.getElementById("btnGoBack")?.addEventListener("click", () => this.goBack());
    }

    private goBack() {
        this.currentParentId = null; 
        this.refresh();
    }

    private async handleCreateFolder() {
        const name = prompt("Nom du dossier :");
        if (!name) return;
        
        await fetch(new URL("../api/media/folder", window.location.href), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label: name, parent: this.currentParentId })
        });
        this.refresh();
    }

    private handleUploadClick() {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.onchange = async () => {
            if (!input.files) return;
            for (const file of Array.from(input.files)) {
                const formData = new FormData();
                formData.append("file", file);
                if (this.currentParentId) formData.append("parent", this.currentParentId);
                await fetch(new URL("../api/media/file", window.location.href), { method: "POST", body: formData });
            }
            this.refresh();
        };
        input.click();
    }

    private handleClickItem(item: MediaItem, element: HTMLElement) {
        if (item.type === "folder") {
            this.currentParentId = item.id;
            this.refresh();
        } else {
            this.shadowRoot?.querySelectorAll(".media-item").forEach(el => el.classList.remove("selected"));
            element.classList.add("selected");
            this.selectedItem = item;
        }
    }

    private confirmSelection() {
        if (this.selectedItem) {
            const src = document.EditorManager.publicRoot + `media?id=${this.selectedItem.id}`
            this.dispatchEvent(new CustomEvent("select-item", { detail: {
                src: src,
                alt: this.selectedItem.label
            }, bubbles: true, composed: true }));
            this.dialog?.close();
        }
    }

    public refresh() {
        this.clearItems();
        
        const backBtn = this.shadowRoot?.getElementById("btnGoBack") as HTMLButtonElement;
        if (backBtn) backBtn.disabled = (this.currentParentId === null);

        const pathDisplay = this.shadowRoot?.getElementById("pathDisplay");
        if (pathDisplay) pathDisplay.textContent = this.currentParentId ? "Sous-dossier" : "Racine";

        const url = new URL("../api/mediaItems", window.location.href);
        url.searchParams.set("types", JSON.stringify(this.types))
        if (this.currentParentId) url.searchParams.set("parent", this.currentParentId);

        fetch(url).then(res => res.json()).then((items: MediaItem[]) => {
            items.forEach(item => this.addItem(item));
        }).catch(console.error);
    }

    show(types?: string[]) {
        this.types = types ?? ["folder", "image", "other"];
        this.currentParentId = null;
        this.selectedItem = null;
        this.dialog?.showModal();
        this.refresh();
    }

    clearItems() {
        if (this.imgContainer) this.imgContainer.innerHTML = "";
        this.selectedItem = null;
    }

    private addItem(item: MediaItem) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("media-item", `type-${item.type}`);
        
        let visual: HTMLElement;
        if (item.type === "image") {
            const img = document.createElement("img");
            img.src = `/media?id=${item.id}&w=128&h=128`;
            img.alt = item.label;
            visual = img;
        } else {
            visual = this.createSVGIcon(item.type === "folder" ? "folder" : "document");
        }

        const label = document.createElement("span");
        label.textContent = item.label;

        wrapper.append(visual, label);
        wrapper.onclick = () => this.handleClickItem(item, wrapper);
        this.imgContainer?.append(wrapper);
    }

    private createSVGIcon(type: "folder" | "document"): HTMLElement {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.style.fill = "#64748b";
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", type === "folder" 
            ? "M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
            : "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z");
        svg.appendChild(path);
        return svg as unknown as HTMLElement;
    }
}

customElements.define("w13c-mediacenter", MediaCenter);