export type MediaItem = {
    id: string;
    type: "folder" | "image" | "other";
    label: string;
    /**
     * Ready-to-use URL served by the active Media provider. Populated from
     * socle's `FileMetadata.absoluteURL`. Folders carry no URL. The admin UI
     * renders this as-is; variants (resized images) are derived via
     * `window._cms.Media.formatImageUrl(...)`.
     */
    absoluteURL?: string;
    mimetype?: string;
    size?: number;
    width?: number;
    height?: number;
    alt?: string;
};

export type BreadcrumbEntry = {
    id: string;
    label: string;
};

export function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function escapeHtml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escapeAttr(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Build a variant (resized) image URL from a `MediaItem`. Delegates to the
 * active Media consumer's `formatImageUrl` so the query-param / path-rewrite
 * convention stays the provider's business. Falls back to the raw
 * `absoluteURL` if the consumer hasn't been installed yet or the item
 * carries no URL (folders, provider race at boot).
 */
export function variantUrl(item: MediaItem, width?: number, height?: number): string {
    if (!item.absoluteURL) return "";
    const media = window._cms?.Media;
    if (!media) return item.absoluteURL;
    return media.formatImageUrl({
        url: item.absoluteURL,
        ...(width  !== undefined ? { width }  : {}),
        ...(height !== undefined ? { height } : {}),
    }).toString();
}
