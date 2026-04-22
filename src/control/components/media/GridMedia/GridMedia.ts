import template from './template.html' with { type: 'text' };
import css from './style.css' with { type: 'text' };
import { Component } from "src/core/Editor/runtime/Component";
import type { DetailMedia } from "../DetailMedia/DetailMedia";
import type { CropSystem } from "../CropSystem/CropSystem";
import type { MediaItem, BreadcrumbEntry } from "./types";

import * as api from "./api";
import { renderGrid, renderBreadcrumb } from "./render";
import { setupContextMenu } from "./context-menu";
import { setupRename } from "./rename";
import { setupNewFolder } from "./new-folder";
import { setupDragDrop } from "./drag-drop";
import { setupDetail } from "./detail";

export class GridMedia extends Component {

    private _folder: string | null = null;
    private _breadcrumb: BreadcrumbEntry[] = [];
    private _items: MediaItem[] = [];

    constructor() {
        super({
            css: css as unknown as string,
            template: template as unknown as string
        });
    }

    get apiBase() { return this.getAttribute("api-base") || "../api"; }
    get detail() { return this.shadowRoot!.getElementById("detail") as unknown as DetailMedia; }
    get crop() { return this.shadowRoot!.getElementById("crop") as unknown as CropSystem; }

    override connectedCallback() {
        const s = this.shadowRoot!;
        this._folder = new URL(window.location.href).searchParams.get("folder");

        // Features
        const ctxMenu = setupContextMenu(s, {
            onRename: (item) => rename.open(item),
            onDelete: (id) => this._confirmDelete(id),
        });

        const rename = setupRename(s, {
            onApply: async (id, name) => {
                await api.renameItem(this.apiBase, id, name);
                this._refresh();
            },
        });

        setupNewFolder(this, s, {
            onCreate: async (name) => {
                await api.createFolder(this.apiBase, name, this._folder);
                this._refresh();
            },
        });

        const dragDrop = setupDragDrop(s, {
            onFiles: async (files) => {
                await api.uploadFiles(this.apiBase, files, this._folder);
                this._refresh();
            },
        });

        const detail = setupDetail(this.detail, {
            onSave: async (id, data) => {
                if (await api.saveItemMetadata(this.apiBase, id, data)) {
                    this.detail.close();
                }
            },
            onDelete: async (id) => {
                if (!confirm("Delete this file?")) return;
                if (await api.deleteItem(this.apiBase, id)) {
                    this.detail.close();
                    this._refresh();
                }
            },
            onClose: () => this._refresh(),
        });

        // Grid clicks
        s.getElementById("grid")!.addEventListener("click", (e) => {
            const card = (e.target as HTMLElement).closest("p9r-card-media") as HTMLElement;
            if (!card) return;

            const id = card.dataset.id!;
            if (card.dataset.type === "folder") {
                const folder = this._items.find(i => i.id === id);
                this._navigateTo(id, folder?.label);
            } else {
                const item = this._items.find(i => i.id === id);
                if (item) detail.open(item);
            }
        });

        // Grid right-click
        s.getElementById("grid")!.addEventListener("contextmenu", (e) => {
            const card = (e.target as HTMLElement).closest("p9r-card-media") as HTMLElement;
            if (!card) return;
            const item = this._items.find(i => i.id === card.dataset.id);
            if (!item) return;
            e.preventDefault();
            ctxMenu.show(e as MouseEvent, item);
        });

        // Breadcrumb clicks
        s.getElementById("breadcrumb")!.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (!target.classList.contains("bc-item")) return;

            const folder = target.dataset.folder || null;
            const index = parseInt(target.dataset.index || "-1");
            this._breadcrumb = this._breadcrumb.slice(0, index + 1);
            this._navigateTo(folder);
        });

        // Public upload method
        this.upload = () => dragDrop.trigger();

        // Initial load
        if (this._folder) {
            api.resolveBreadcrumbTrail(this.apiBase, this._folder).then(trail => {
                this._breadcrumb = trail;
                this._render();
            });
        }

        this._refresh();
    }

    // ── State ──

    upload() {}

    private async _refresh() {
        this._items = await api.fetchItems(this.apiBase, this._folder);
        this._render();
    }

    private _render() {
        renderGrid(this.shadowRoot!.getElementById("grid")!, this._items);
        renderBreadcrumb(this.shadowRoot!.getElementById("breadcrumb")!, this._folder, this._breadcrumb);
    }

    private _navigateTo(folderId: string | null, label?: string) {
        const url = new URL(window.location.href);
        if (folderId) url.searchParams.set("folder", folderId);
        else url.searchParams.delete("folder");
        window.history.pushState({}, "", url.toString());

        this._folder = folderId;
        if (!folderId) this._breadcrumb = [];
        else if (label) this._breadcrumb.push({ id: folderId, label });

        this._refresh();
    }

    private async _confirmDelete(id: string) {
        if (!confirm("Delete this item?")) return;
        if (await api.deleteItem(this.apiBase, id)) this._refresh();
    }
}

if ( !customElements.get("p9r-grid-media") ) { 
    customElements.define("p9r-grid-media", GridMedia);
}