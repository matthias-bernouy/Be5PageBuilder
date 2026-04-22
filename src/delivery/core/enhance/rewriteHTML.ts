import { parseHTML } from "linkedom";
import type { MediaUrlBuilder } from "@bernouy/socle";

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
 * Variant URLs are built through Socle's `MediaUrlBuilder.formatImageUrl`,
 * passing the original `<img src>` as the source URL. The provider decides
 * how to encode width parameters. Images whose src is external, a data URI,
 * or a likely-SVG are skipped (srcset only makes sense when the media
 * backend can return real raster variants).
 */
export function rewriteHTML(
    html: string,
    rewrites: readonly ImageRewrite[],
    media: MediaUrlBuilder,
): string {
    if (rewrites.length === 0) return html;

    const { document } = parseHTML(html);
    const imgs = document.querySelectorAll("img");
    const byIndex = new Map(rewrites.map(r => [r.index, r]));

    imgs.forEach((img: any, i: number) => {
        const rw = byIndex.get(i);
        if (!rw) return;

        if (rw.widths.length > 0) {
            const src = img.getAttribute("src");
            if (src && isOptimizable(src)) {
                const srcset = rw.widths
                    .map(w => `${media.formatImageUrl({ url: src, width: w }).toString()} ${w}w`)
                    .join(", ");
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
 * Decide whether an `<img src>` can be srcset-optimized. Excludes data URIs
 * (no backend to resize them) and likely-SVG URLs (rasterizing SVGs through
 * a width ladder is pointless — the browser renders them at any size). Any
 * remaining URL, including external ones, is handed to `formatImageUrl` and
 * the provider decides what to do with it.
 */
export function isOptimizable(src: string): boolean {
    if (!src) return false;
    if (src.startsWith("data:")) return false;
    // Strip query and fragment before the extension check — SVG URLs in the
    // wild sometimes carry either or both.
    const base = (src.split(/[?#]/)[0] ?? "").toLowerCase();
    if (base.endsWith(".svg")) return false;
    return true;
}
