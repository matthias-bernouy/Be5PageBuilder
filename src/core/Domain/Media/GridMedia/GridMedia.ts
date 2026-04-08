import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from "src/core/Editor/core/Component";
import type { DetailMedia } from "../DetailMedia/DetailMedia";
import type { CropSystem } from "../CropSystem/CropSystem";

type MediaItem = {
    id: string;
    type: "folder" | "image" | "other";
    label: string;
    mimetype?: string;
    size?: number;
    width?: number;
    height?: number;
    alt?: string;
};

function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function escapeHtml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}


export class GridMedia extends Component {

    private _folder: string | null = null;
    private _folderLabel: string | null = null;
    private _items: MediaItem[] = [];
    private _activeItem: MediaItem | null = null;

    constructor() {
        super({
            css: css as unknown as string,
            template: template as unknown as string
        });
    }

    get apiBase(): string {
        return this.getAttribute("api-base") || "../api";
    }

    get detail(): DetailMedia {
        return this.shadowRoot!.getElementById("detail") as unknown as DetailMedia;
    }

    get crop(): CropSystem {
        return this.shadowRoot!.getElementById("crop") as unknown as CropSystem;
    }

    override connectedCallback() {
        const s = this.shadowRoot!;

        // Read initial folder from URL
        const url = new URL(window.location.href);
        this._folder = url.searchParams.get("folder");

        // Bind UI
        this._setupGrid(s);
        this._setupNewFolder(s);
        this._setupDragDrop(s);
        this._setupDetail();
        this._setupKeyboard();

        // Resolve folder label if landing on a subfolder
        if (this._folder) {
            this._resolveFolderLabel(this._folder);
        }

        // Initial fetch
        this._fetchAndRender();
    }

    private async _resolveFolderLabel(id: string) {
        const res = await fetch(`${this.apiBase}/media/item?id=${id}`);
        if (!res.ok) return;
        const item = await res.json();
        if (item?.label) {
            this._folderLabel = item.label;
            this._renderBreadcrumb();
        }
    }

    // ── Fetch & Render ──

    private async _fetchAndRender() {
        const params = new URLSearchParams();
        if (this._folder) params.set("parent", this._folder);
        params.set("types", JSON.stringify(["folder", "image", "other"]));

        const res = await fetch(`${this.apiBase}/mediaItems?${params}`);
        if (!res.ok) return;

        const items: MediaItem[] = await res.json();

        // Sort: folders first, then alphabetical
        items.sort((a, b) => {
            if (a.type === "folder" && b.type !== "folder") return -1;
            if (a.type !== "folder" && b.type === "folder") return 1;
            return a.label.localeCompare(b.label);
        });

        this._items = items;
        this._renderGrid();
        this._renderBreadcrumb();
    }

    private _renderGrid() {
        const grid = this.shadowRoot!.getElementById("grid")!;
        grid.innerHTML = "";

        for (const item of this._items) {
            const card = document.createElement("p9r-card-media");
            card.setAttribute("data-id", item.id);
            card.setAttribute("data-type", item.type);

            if (item.type === "folder") {
                card.setAttribute("type", "folder");
            } else {
                const isImage = item.type === "image";
                const isSvg = item.mimetype === "image/svg+xml";

                if (isImage || isSvg) {
                    const img = document.createElement("img");
                    img.slot = "image";
                    img.src = `/media?id=${item.id}${isSvg ? '' : '&w=360&h=270'}`;
                    img.alt = item.alt || item.label;
                    img.loading = "lazy";
                    card.appendChild(img);
                } else {
                    const ext = item.label.split('.').pop()?.toUpperCase() || "FILE";
                    const icon = document.createElement("span");
                    icon.slot = "image";
                    icon.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${ext}</span>
                    `;
                    icon.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;width:100%;height:100%;color:var(--text-muted,#94a3b8);";
                    card.appendChild(icon);
                }
            }

            const label = document.createElement("span");
            label.slot = "label";
            label.textContent = item.label;
            card.appendChild(label);

            grid.appendChild(card);
        }
    }

    private _renderBreadcrumb() {
        const bc = this.shadowRoot!.getElementById("breadcrumb")!;

        if (!this._folder) {
            bc.innerHTML = `<span class="bc-current">Root</span>`;
        } else {
            const name = this._folderLabel || this._folder;
            bc.innerHTML = `
                <span class="bc-item" data-folder="">Root</span>
                <span class="bc-sep">/</span>
                <span class="bc-current">${escapeHtml(name)}</span>
            `;
        }
    }

    // ── Grid interactions ──

    private _setupGrid(s: ShadowRoot) {
        const grid = s.getElementById("grid")!;
        const breadcrumb = s.getElementById("breadcrumb")!;

        grid.addEventListener("click", (e) => {
            const card = (e.target as HTMLElement).closest("p9r-card-media") as HTMLElement;
            if (!card) return;

            const id = card.dataset.id!;
            const type = card.dataset.type!;

            if (type === "folder") {
                const folder = this._items.find(i => i.id === id);
                this._navigateTo(id, folder?.label);
            } else {
                const item = this._items.find(i => i.id === id);
                if (item) this._openDetail(item);
            }
        });

        breadcrumb.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains("bc-item")) {
                const folder = target.dataset.folder || null;
                this._navigateTo(folder);
            }
        });
    }

    private _navigateTo(folderId: string | null, label?: string) {
        const url = new URL(window.location.href);
        if (folderId) {
            url.searchParams.set("folder", folderId);
        } else {
            url.searchParams.delete("folder");
        }
        window.history.pushState({}, "", url.toString());
        this._folder = folderId;
        this._folderLabel = label || null;
        this._fetchAndRender();
    }

    // ── New folder ──

    private _setupNewFolder(s: ShadowRoot) {
        const backdrop = s.getElementById("nf-backdrop")!;
        const input = s.getElementById("nf-input") as HTMLInputElement;
        const confirmBtn = s.getElementById("nf-confirm")!;
        const cancelBtn = s.getElementById("nf-cancel")!;

        const show = () => {
            input.value = "";
            backdrop.classList.add("visible");
            requestAnimationFrame(() => input.focus());
        };

        const hide = () => backdrop.classList.remove("visible");

        this.addEventListener("new-folder", show);

        const create = async () => {
            const name = input.value.trim();
            if (!name) return;
            hide();

            await fetch(`${this.apiBase}/media/folder`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ label: name, parent: this._folder || undefined })
            });

            this._fetchAndRender();
        };

        confirmBtn.addEventListener("click", create);
        cancelBtn.addEventListener("click", hide);
        backdrop.addEventListener("click", (e) => { if (e.target === backdrop) hide(); });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") create();
            if (e.key === "Escape") hide();
        });
    }

    // ── Upload & drag/drop ──

    upload() {
        (this.shadowRoot!.getElementById("file-input") as HTMLInputElement).click();
    }

    private _setupDragDrop(s: ShadowRoot) {
        const fileInput = s.getElementById("file-input") as HTMLInputElement;
        const dropOverlay = s.getElementById("drop-overlay")!;
        let dragCounter = 0;
        let internalDrag = false;

        fileInput.addEventListener("change", () => {
            if (fileInput.files?.length) this._uploadFiles(fileInput.files);
        });

        // Detect drags starting from inside the grid
        s.getElementById("grid")!.addEventListener("dragstart", () => {
            internalDrag = true;
        });

        document.addEventListener("dragend", () => {
            internalDrag = false;
        });

        document.addEventListener("dragenter", (e) => {
            e.preventDefault();
            if (internalDrag) return;
            dragCounter++;
            if (dragCounter === 1) dropOverlay.classList.add("visible");
        });

        document.addEventListener("dragleave", (e) => {
            e.preventDefault();
            if (internalDrag) return;
            dragCounter--;
            if (dragCounter === 0) dropOverlay.classList.remove("visible");
        });

        document.addEventListener("dragover", (e) => e.preventDefault());

        document.addEventListener("drop", (e) => {
            e.preventDefault();
            dragCounter = 0;
            dropOverlay.classList.remove("visible");
            if (internalDrag) { internalDrag = false; return; }
            if (e.dataTransfer?.files.length) this._uploadFiles(e.dataTransfer.files);
        });
    }

    private async _uploadFiles(files: FileList) {
        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            if (!file) continue;
            const form = new FormData();
            form.append("file", file);
            if (this._folder) form.append("parent", this._folder);

            await fetch(`${this.apiBase}/media/file`, {
                method: "POST",
                body: form
            });
        }

        this._fetchAndRender();
    }

    // ── Detail modal ──

    private _setupDetail() {
        this.detail.addEventListener("close", () => {
            this._activeItem = null;
        });
    }

    private _openDetail(item: MediaItem) {
        this._activeItem = item;
        const detail = this.detail;
        const isImage = item.type === "image" || item.mimetype === "image/svg+xml";
        const isSvg = item.mimetype === "image/svg+xml";
        const size = item.size ? formatSize(item.size) : "";
        const dims = (item.width && item.height) ? `${item.width}×${item.height}` : "";
        const mediaUrl = `/media?id=${item.id}`;

        // Set URL for copy button
        detail.setAttribute("media-url", mediaUrl);

        // Clear previous slotted content
        detail.innerHTML = "";

        // Preview image
        if (isImage) {
            const img = document.createElement("img");
            img.slot = "preview";
            img.src = `/media?id=${item.id}${isSvg ? '' : '&w=720&h=540'}`;
            img.alt = item.alt || item.label;
            detail.appendChild(img);
        }

        // Fields
        const fields = document.createElement("div");
        fields.slot = "fields";
        fields.innerHTML = `
            <div class="detail-field">
                <label>Name</label>
                <input type="text" id="detail-label" value="${escapeAttr(item.label)}">
            </div>
            ${isImage ? `
            <div class="detail-field">
                <label>Alt text</label>
                <textarea id="detail-alt" rows="2">${escapeHtml(item.alt || '')}</textarea>
            </div>` : ""}
            <div class="detail-meta-row">
                <div class="detail-field">
                    <label>Type</label>
                    <span class="detail-value">${escapeHtml(item.mimetype || item.type)}</span>
                </div>
                <div class="detail-field">
                    <label>Size</label>
                    <span class="detail-value">${size || "—"}</span>
                </div>
            </div>
            ${dims ? `
            <div class="detail-field">
                <label>Dimensions</label>
                <span class="detail-value">${escapeHtml(dims)}</span>
            </div>` : ""}
            <div class="detail-field">
                <label>URL</label>
                <div class="url-row">
                    <span class="detail-value mono">${escapeHtml(mediaUrl)}</span>
                    <button class="btn-copy" id="btn-copy" title="Copy URL">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                </div>
            </div>
        `;
        detail.appendChild(fields);

        // Copy URL button
        const copyBtn = fields.querySelector("#btn-copy")!;
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(mediaUrl);
            const svg = copyBtn.innerHTML;
            copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
            setTimeout(() => { copyBtn.innerHTML = svg; }, 1500);
        });

        // Actions
        const actions = document.createElement("div");
        actions.slot = "actions";
        actions.innerHTML = `
            <div class="detail-actions">
                <button class="btn-save" id="btn-save">Save</button>
                <button class="btn-delete" id="btn-delete">Delete</button>
            </div>
        `;
        detail.appendChild(actions);

        actions.querySelector("#btn-save")!.addEventListener("click", () => this._saveDetail());
        actions.querySelector("#btn-delete")!.addEventListener("click", () => this._deleteDetail());

        detail.open(item.label);
    }

    private async _saveDetail() {
        if (!this._activeItem) return;

        const detail = this.detail;
        const labelInput = detail.querySelector("#detail-label") as HTMLInputElement;
        const altInput = detail.querySelector("#detail-alt") as HTMLTextAreaElement | null;

        const body: Record<string, string> = { label: labelInput.value };
        if (altInput) body.alt = altInput.value;

        const res = await fetch(`${this.apiBase}/media/item?id=${this._activeItem.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            detail.close();
            this._fetchAndRender();
        }
    }

    private async _deleteDetail() {
        if (!this._activeItem) return;
        if (!confirm("Delete this file?")) return;

        const res = await fetch(`${this.apiBase}/media/item?id=${this._activeItem.id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            this.detail.close();
            this._fetchAndRender();
        }
    }

    // ── Keyboard ──

    private _setupKeyboard() {
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                const backdrop = this.shadowRoot!.getElementById("nf-backdrop")!;
                if (backdrop.classList.contains("visible")) {
                    backdrop.classList.remove("visible");
                }
            }
        });
    }
}

customElements.define("p9r-grid-media", GridMedia);
