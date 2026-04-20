import type { Cms } from "src/Cms";

/**
 * Paths that are always reserved by the framework and cannot be used as page
 * paths. Some are exact, some are prefixes. Kept in one place so validation
 * and runtime checks stay consistent.
 */
const EXACT_RESERVED = new Set([
    "/bloc",
    "/style",
    "/media",
    "/font",
    "/robots.txt",
    "/sitemap.xml",
]);

function normalizePath(path: string): string {
    const segments = path.split("/");
    const stack: string[] = [];
    for (const seg of segments) {
        if (seg === "" || seg === ".") continue;
        if (seg === "..") { stack.pop(); continue; }
        stack.push(seg);
    }
    return "/" + stack.join("/");
}

export function isReservedPath(path: string, cms: Cms): boolean {
    const adminPrefix = cms.config.adminPathPrefix || "/cms";
    const candidates = [path, normalizePath(path)];
    for (const p of candidates) {
        if (p === adminPrefix || p.startsWith(adminPrefix + "/")) return true;
        if (EXACT_RESERVED.has(p)) return true;
    }
    return false;
}
