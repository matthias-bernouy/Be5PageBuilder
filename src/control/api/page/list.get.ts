import type { ControlCms } from "src/control/ControlCms";

export default async function getPages(req: Request, cms: ControlCms) {
    const url = new URL(req.url);
    const q          = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const visibility = url.searchParams.get("visibility") ?? "all";
    const rawSort    = url.searchParams.get("sort") ?? "title:asc";
    const [sortKey, sortDir] = rawSort.split(":");

    const all = await cms.repository.getAllPages();

    const pages = all
        .map(p => ({
            title:        p.title || "",
            path:         p.path,
            visible:      !!p.visible,
            tags:         normalizeTags(p.tags),
            visibleLabel: p.visible ? "Published" : "Draft",
            visibleColor: p.visible ? "success"   : "danger",
            editorPath:   `${cms.basePath}/admin/editor?path=${encodeURIComponent(p.path)}`,
        }))
        .filter(p => {
            if (q && !`${p.title}\n${p.path}`.toLowerCase().includes(q)) return false;
            if (visibility === "published" && !p.visible) return false;
            if (visibility === "draft"     &&  p.visible) return false;
            return true;
        })
        .sort((a, b) => {
            const mul = sortDir === "desc" ? -1 : 1;
            if (sortKey === "path")       return a.path.localeCompare(b.path) * mul;
            if (sortKey === "visibility") return (Number(b.visible) - Number(a.visible)) * mul;
            return (a.title || a.path).localeCompare(b.title || b.path) * mul;
        });

    return new Response(JSON.stringify({ pages }), {
        headers: { "Content-Type": "application/json" },
    });
}

function normalizeTags(raw: unknown): string[] {
    if (Array.isArray(raw)) return raw.filter((t): t is string => typeof t === "string");
    if (typeof raw === "string" && raw.trim().startsWith("[")) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed.filter((t): t is string => typeof t === "string");
        } catch { /* fall through */ }
    }
    return [];
}
