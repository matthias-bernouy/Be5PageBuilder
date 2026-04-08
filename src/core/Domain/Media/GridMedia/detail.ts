import type { MediaItem } from "./types";
import { escapeHtml, escapeAttr, formatSize } from "./types";
import type { DetailMedia } from "../DetailMedia/DetailMedia";

const ICON_COPY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const ICON_CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

type DetailCallbacks = {
    onSave: (id: string, data: Record<string, string>) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
};

export function setupDetail(detail: DetailMedia, callbacks: DetailCallbacks) {
    detail.addEventListener("close", () => callbacks.onClose());

    return {
        open(item: MediaItem) {
            detail.innerHTML = "";

            const preview = buildPreview(item);
            if (preview) detail.appendChild(preview);

            const fields = buildFields(item);
            detail.appendChild(fields);

            const actions = buildActions();
            detail.appendChild(actions);

            actions.querySelector("#btn-save")!.addEventListener("click", () => {
                const data = readFields(detail);
                callbacks.onSave(item.id, data);
            });

            actions.querySelector("#btn-delete")!.addEventListener("click", () => {
                callbacks.onDelete(item.id);
            });

            fields.addEventListener("keydown", (e: Event) => {
                if ((e as KeyboardEvent).key === "Enter") {
                    e.preventDefault();
                    const data = readFields(detail);
                    callbacks.onSave(item.id, data);
                }
            });

            detail.open(item.label);
        }
    };
}

function readFields(detail: DetailMedia): Record<string, string> {
    const labelInput = detail.querySelector("#detail-label") as HTMLInputElement;
    const altInput = detail.querySelector("#detail-alt") as HTMLTextAreaElement | null;

    const data: Record<string, string> = { label: labelInput.value };
    if (altInput) data.alt = altInput.value;
    return data;
}

function buildPreview(item: MediaItem): HTMLElement | null {
    const isImage = item.type === "image" || item.mimetype === "image/svg+xml";
    if (!isImage) return null;

    const isSvg = item.mimetype === "image/svg+xml";
    const img = document.createElement("img");
    img.slot = "preview";
    img.src = `/media?id=${item.id}${isSvg ? '' : '&w=720&h=540'}`;
    img.alt = item.alt || item.label;
    return img;
}

function buildFields(item: MediaItem): HTMLElement {
    const isImage = item.type === "image" || item.mimetype === "image/svg+xml";
    const size = item.size ? formatSize(item.size) : "";
    const dims = (item.width && item.height) ? `${item.width}\u00d7${item.height}` : "";
    const mediaUrl = `/media?id=${item.id}`;

    const el = document.createElement("div");
    el.slot = "fields";
    el.innerHTML = `
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
                <span class="detail-value">${size || "\u2014"}</span>
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
                <button class="btn-copy" id="btn-copy" title="Copy URL">${ICON_COPY}</button>
            </div>
        </div>
    `;

    const copyBtn = el.querySelector("#btn-copy")!;
    copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(mediaUrl);
        copyBtn.innerHTML = ICON_CHECK;
        setTimeout(() => { copyBtn.innerHTML = ICON_COPY; }, 1500);
    });

    return el;
}

function buildActions(): HTMLElement {
    const el = document.createElement("div");
    el.slot = "actions";
    el.innerHTML = `
        <div class="detail-actions">
            <button class="btn-save" id="btn-save">Save</button>
            <button class="btn-delete" id="btn-delete">Delete</button>
        </div>
    `;
    return el;
}
