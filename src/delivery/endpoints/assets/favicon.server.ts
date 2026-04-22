import type DeliveryCms from "src/delivery/DeliveryCms";
import { compress, sendCompressed } from "src/socle/server/compression";

/**
 * Default Delivery favicon served at `<cmsPathPrefix>/assets/favicon`.
 *
 * Used by `renderPage` when `settings.site.favicon` is empty. Inline SVG so
 * we don't depend on a bundled binary asset and the bytes are gzip-friendly.
 */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" rx="12" fill="#4361ee"/>` +
    `<rect x="12" y="14" width="40" height="8" rx="2" fill="#ffffff" opacity="0.95"/>` +
    `<rect x="12" y="28" width="24" height="8" rx="2" fill="#ffffff" opacity="0.80"/>` +
    `<rect x="12" y="42" width="32" height="8" rx="2" fill="#ffffff" opacity="0.90"/>` +
    `</svg>`;

export default async function FaviconServer(req: Request, _delivery: DeliveryCms) {
    return sendCompressed(req, compress(SVG, "image/svg+xml"));
}
