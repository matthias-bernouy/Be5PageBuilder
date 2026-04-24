import type { ControlCms } from "src/control/ControlCms";

export default async function getTemplates(_req: Request, cms: ControlCms) {
    const templates = await cms.repository.getAllTemplates();
    return new Response(JSON.stringify(templates), {
        headers: { "Content-Type": "application/json" }
    });
}
