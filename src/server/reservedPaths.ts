import type { PageBuilder } from "src/PageBuilder";

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
]);

export function isReservedPath(path: string, system: PageBuilder): boolean {
    const adminPrefix = system.config.adminPathPrefix || "/page-builder";
    if (path === adminPrefix || path.startsWith(adminPrefix + "/")) return true;
    if (EXACT_RESERVED.has(path)) return true;
    return false;
}

/**
 * Basic format check: must start with a slash, no query string, no fragment,
 * no `:` (which Be5_Runner.matchPath would interpret as a route parameter).
 */
export function isValidPathFormat(path: string): boolean {
    if (!path || typeof path !== "string") return false;
    if (!path.startsWith("/")) return false;
    if (path.includes("?") || path.includes("#") || path.includes(":")) return false;
    return true;
}
