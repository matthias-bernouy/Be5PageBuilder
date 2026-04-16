import { parseHTML } from "linkedom";

export type ImageRewrite = {
    /** Index in document order — must align with `document.querySelectorAll('img')`. */
    index: number;
    /** Ladder rungs to list in srcset, ascending. Empty → don't touch srcset. */
    widths: number[];
    /** Pre-built `sizes` attribute. Empty → don't emit `sizes`. */
    sizes: string;
    /**
     * `lazy` → force `loading="lazy"`. `eager` → remove any existing
     * `loading` attribute (HTML default is eager anyway). Omitted → leave
     * the attribute exactly as the bloc authored it.
     */
    loading?: "lazy" | "eager";
    /**
     * `high` → force `fetchpriority="high"`. `auto` → remove any existing
     * `fetchpriority` (auto is the default). Omitted → leave untouched.
     */
    fetchpriority?: "high" | "auto";
};

/**
 * Take the rendered page HTML and inject `srcset` / `sizes` on every
 * `<img>` whose index has a matching rewrite. Other `<img>` tags are left
 * exactly as-is. Returns the serialized HTML.
 *
 * The `<img>` URL is parsed to extract its base — typically
 * `/media?id=ABC` plus optional `&w=…&h=…` — and the srcset is built by
 * appending `&w=<rung>` for each ladder width. `sizes` is written verbatim.
 *
 * Images whose src can't be parsed (external URLs, data: URIs, missing src)
 * are silently skipped: srcset only makes sense when we control the
 * resize endpoint.
 */
export function rewriteHTML(html: string, rewrites: readonly ImageRewrite[]): string {
    if (rewrites.length === 0) return html;

    const { document } = parseHTML(html);
    const imgs = document.querySelectorAll("img");
    const byIndex = new Map(rewrites.map(r => [r.index, r]));

    imgs.forEach((img: any, i: number) => {
        const rw = byIndex.get(i);
        if (!rw) return;

        // srcset/sizes path — only applies to images we can serve through
        // /media (external URLs, data: URIs, etc. are skipped).
        if (rw.widths.length > 0) {
            const src = img.getAttribute("src");
            const base = baseSrcWithoutDimension(src);
            if (base) {
                const srcset = rw.widths.map(w => `${base}&w=${w} ${w}w`).join(", ");
                img.setAttribute("srcset", srcset);
                if (rw.sizes) img.setAttribute("sizes", rw.sizes);
            }
        }

        // loading/fetchpriority apply to every <img>, regardless of src —
        // an external image above the fold still benefits from eager load.
        if (rw.loading === "lazy") img.setAttribute("loading", "lazy");
        else if (rw.loading === "eager") img.removeAttribute("loading");

        if (rw.fetchpriority === "high") img.setAttribute("fetchpriority", "high");
        else if (rw.fetchpriority === "auto") img.removeAttribute("fetchpriority");
    });

    return document.toString();
}

/**
 * Strip `w` / `h` from an `<img src>` so the base can be safely re-suffixed
 * with each ladder rung. Returns null for srcs we shouldn't touch (external
 * URLs, data URIs, srcs without an `id` query — i.e. anything that doesn't
 * route through our `/media` endpoint).
 */
function baseSrcWithoutDimension(src: string | null): string | null {
    if (!src) return null;
    if (src.startsWith("data:")) return null;
    if (/^https?:\/\//i.test(src)) return null;

    // We only know how to optimize through `/media?id=…`. Any other shape
    // (a static asset, a dynamically generated URL) is left to the bloc.
    if (!/^\/media\?/i.test(src)) return null;
    if (!/[?&]id=/i.test(src)) return null;

    const [pathPart, queryPart = ""] = src.split("?", 2);
    const params = new URLSearchParams(queryPart);
    params.delete("w");
    params.delete("h");
    const cleaned = params.toString();
    return cleaned ? `${pathPart}?${cleaned}` : `${pathPart}?`;
}

/**
 * Helper for callers that need to learn each `<img>`'s media id without
 * re-parsing. Returns the `id` query value, or null when the src isn't
 * routable through our resize endpoint.
 */
export function extractMediaId(src: string | null): string | null {
    if (!src) return null;
    if (!/^\/media\?/i.test(src)) return null;
    const [, queryPart = ""] = src.split("?", 2);
    const params = new URLSearchParams(queryPart);
    return params.get("id");
}
