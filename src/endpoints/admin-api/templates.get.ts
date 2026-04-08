import type { PageBuilder } from "src/PageBuilder";

export default async function getTemplates(_req: Request, system: PageBuilder) {
    const templates = await system.repository.getAllTemplates();
    return new Response(JSON.stringify(templates), {
        headers: { "Content-Type": "application/json" }
    });
}
