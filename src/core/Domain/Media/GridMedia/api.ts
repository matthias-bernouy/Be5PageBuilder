import type { MediaItem, BreadcrumbEntry } from "./types";

export async function fetchItems(apiBase: string, folder: string | null): Promise<MediaItem[]> {
    const params = new URLSearchParams();
    if (folder) params.set("parent", folder);
    params.set("types", JSON.stringify(["folder", "image", "other"]));

    const res = await fetch(`${apiBase}/mediaItems?${params}`);
    if (!res.ok) return [];

    const items: MediaItem[] = await res.json();

    items.sort((a, b) => {
        if (a.type === "folder" && b.type !== "folder") return -1;
        if (a.type !== "folder" && b.type === "folder") return 1;
        return a.label.localeCompare(b.label);
    });

    return items;
}

export async function resolveBreadcrumbTrail(apiBase: string, id: string): Promise<BreadcrumbEntry[]> {
    const trail: BreadcrumbEntry[] = [];
    let currentId: string | null = id;

    while (currentId) {
        const res: Response = await fetch(`${apiBase}/media/item?id=${currentId}`);
        if (!res.ok) break;
        const item: { label: string; parent?: string | null } = await res.json();
        if (!item) break;
        trail.unshift({ id: currentId, label: item.label });
        currentId = item.parent || null;
    }

    return trail;
}

export async function renameItem(apiBase: string, id: string, label: string): Promise<boolean> {
    const res = await fetch(`${apiBase}/media/item?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label })
    });
    return res.ok;
}

export async function deleteItem(apiBase: string, id: string): Promise<boolean> {
    const res = await fetch(`${apiBase}/media/item?id=${id}`, { method: "DELETE" });
    return res.ok;
}

export async function createFolder(apiBase: string, label: string, parent: string | null): Promise<boolean> {
    const res = await fetch(`${apiBase}/media/folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, parent: parent || undefined })
    });
    return res.ok;
}

export async function uploadFiles(apiBase: string, files: FileList, folder: string | null): Promise<void> {
    for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file) continue;
        const form = new FormData();
        form.append("file", file);
        if (folder) form.append("parent", folder);

        await fetch(`${apiBase}/media/file`, { method: "POST", body: form });
    }
}

export async function saveItemMetadata(apiBase: string, id: string, data: Record<string, string>): Promise<boolean> {
    const res = await fetch(`${apiBase}/media/item?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    return res.ok;
}
