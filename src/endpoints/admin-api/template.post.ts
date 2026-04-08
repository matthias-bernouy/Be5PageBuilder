import type { PageBuilder } from "src/PageBuilder";
import type { TTemplate } from "src/interfaces/contract/Repository/TModels";

export default async function postTemplate(req: Request, system: PageBuilder) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const body = await req.json() as Partial<TTemplate>;

    if (id) {
        const updated = await system.repository.updateTemplate(id, body);
        if (!updated) return new Response("Not found", { status: 404 });
        return new Response(JSON.stringify(updated), {
            headers: { "Content-Type": "application/json" }
        });
    }

    if (!body.name || !body.content) {
        return new Response("Missing required fields: name, content", { status: 400 });
    }

    const template: TTemplate = {
        name: body.name,
        description: body.description || "",
        content: body.content,
        category: body.category || "",
        createdAt: new Date()
    };

    const created = await system.repository.createTemplate(template);
    return new Response(JSON.stringify(created), {
        status: 201,
        headers: { "Content-Type": "application/json" }
    });
}
