import type { ControlCms } from "src/control/ControlCms";

export default async function getTemplates(_req: Request, cms: ControlCms) {
    const templates = await cms.repository.getAllTemplates();
    const rows = templates.map(t => ({
        ...t,
        editorPath: `${cms.basePath}/admin/templates/editor?id=${encodeURIComponent(t.id!)}`,
        createdLabel: t.createdAt
            ? new Date(t.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
            : "—",
    }));
    return new Response(JSON.stringify(rows), {
        headers: { "Content-Type": "application/json" }
    });
}
