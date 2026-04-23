import type { MediaItem as LocalMediaItem, BreadcrumbEntry } from "./types";
import type { MediaItem as SocleMediaItem, Media } from "@bernouy/socle";

/**
 * Thin wrapper around `window._cms.Media`. The admin shell injects that
 * object via `/<basePath>/_cms/media.js` (a hydrated instance of the active
 * server-side Media provider). Every call below delegates to its methods
 * and adapts the socle response shape (`MediaResponse<T>`, `name`,
 * `mimeType`, …) to the local `MediaItem` shape used across the admin-UI.
 *
 * Historical `apiBase` parameter is kept for signature compatibility with
 * the existing call sites but ignored — all HTTP concerns now live inside
 * whatever SDK the Media provider installed on `window._cms.Media`.
 */

function media(): Media {
    const m = window._cms?.Media;
    if (!m) {
        throw new Error(
            "window._cms.Media is not available. Check that the admin page loaded /<basePath>/_cms/media.js.",
        );
    }
    return m;
}

function toLocal(item: SocleMediaItem): LocalMediaItem {
    const local: LocalMediaItem = {
        id:    item.id,
        type:  item.type === "folder" ? "folder" : item.type === "image" ? "image" : "other",
        label: item.name,
    };
    if (item.type !== "folder") {
        local.mimetype = item.mimeType;
        local.size     = item.size;
    }
    if (item.type === "image") {
        local.width  = item.imageInfo.width;
        local.height = item.imageInfo.height;
    }
    return local;
}

/**
 * Filter expressed in the admin-UI's compact vocabulary (`folder` / `image`
 * / `other`). `other` stands in for every non-folder non-image file type in
 * socle (video, audio, pdf, document, text, archive, other). Absent filter
 * = fetch everything.
 */
export type LocalTypeFilter = ("folder" | "image" | "other")[];

export async function fetchItems(
    _apiBase: string,
    folder: string | null,
    types?: LocalTypeFilter,
): Promise<LocalMediaItem[]> {
    const res = await media().getItems({
        folderID:   folder ?? undefined,
        accept:     expandAccept(types),
        pagination: { page: 1, limit: 10_000 },
        sortBy:     "name",
    });
    if (!res.ok) return [];

    const items = res.data.items.map(toLocal);
    items.sort((a, b) => {
        if (a.type === "folder" && b.type !== "folder") return -1;
        if (a.type !== "folder" && b.type === "folder") return 1;
        return a.label.localeCompare(b.label);
    });
    return items;
}

function expandAccept(types?: LocalTypeFilter): SocleMediaItem["type"][] {
    const all: SocleMediaItem["type"][] = [
        "folder", "image", "video", "audio", "pdf", "document", "text", "archive", "other",
    ];
    if (!types || types.length === 0) return all;
    const out: SocleMediaItem["type"][] = [];
    if (types.includes("folder")) out.push("folder");
    if (types.includes("image"))  out.push("image");
    if (types.includes("other"))  out.push("video", "audio", "pdf", "document", "text", "archive", "other");
    return out;
}

export async function resolveBreadcrumbTrail(_apiBase: string, id: string): Promise<BreadcrumbEntry[]> {
    const trail: BreadcrumbEntry[] = [];
    let currentId: string | null = id;

    while (currentId) {
        const res = await media().getItem(currentId);
        if (!res.ok) break;
        const item = res.data;
        trail.unshift({ id: item.id, label: item.name });
        currentId = item.parentFolderID;
    }
    return trail;
}

export async function renameItem(_apiBase: string, id: string, label: string): Promise<boolean> {
    const res = await media().updateItem({ id, name: label });
    return res.ok;
}

export async function deleteItem(_apiBase: string, id: string): Promise<boolean> {
    // Recursive by default so the admin-UI's single "Delete" button stays
    // equivalent to the prior behavior (the server used to walk subtrees on
    // its own). Providers that can't descend will surface a `folder_not_empty`
    // error and `ok: false` propagates.
    const res = await media().deleteItem({ id, recursive: true });
    return res.ok;
}

export async function createFolder(_apiBase: string, label: string, parent: string | null): Promise<boolean> {
    const res = await media().createFolder({
        name:           label,
        ...(parent ? { parentFolderID: parent } : {}),
    });
    return res.ok;
}

export async function uploadFiles(_apiBase: string, files: FileList, folder: string | null): Promise<void> {
    for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file) continue;
        await media().uploadFile({
            data:     file,
            name:     file.name,
            mimeType: file.type || "application/octet-stream",
            size:     file.size,
            ...(folder ? { folderID: folder } : {}),
        });
    }
}

/**
 * Socle's `updateItem` only accepts `name` and `parentFolderID`. The old
 * repository contract accepted a free-form metadata bag (`alt`, tags, …);
 * those fields are silently dropped now. Providers that want richer
 * metadata editing should extend their Media class and the admin-UI side
 * of it accordingly.
 */
export async function saveItemMetadata(_apiBase: string, id: string, data: Record<string, string>): Promise<boolean> {
    const patch: { name?: string; parentFolderID?: string } = {};
    if (typeof data["label"] === "string") patch.name = data["label"];
    if (typeof data["parent"] === "string") patch.parentFolderID = data["parent"];
    if (Object.keys(patch).length === 0) return true;
    const res = await media().updateItem({ id, ...patch });
    return res.ok;
}
