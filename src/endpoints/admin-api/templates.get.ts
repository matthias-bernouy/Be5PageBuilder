import type { Cms } from "src/Cms";

export default async function getTemplates(_req: Request, cms: Cms) {
    const templates = await cms.repository.getAllTemplates();
    return new Response(JSON.stringify(templates), {
        headers: { "Content-Type": "application/json" }
    });
}
