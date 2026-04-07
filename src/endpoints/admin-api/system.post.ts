import type { PageBuilder } from "src/PageBuilder";
import type { TSystem } from "src/interfaces/contract/Repository/TModels";

export default async function updateSystem(req: Request, system: PageBuilder) {
    const body = await req.json() as Partial<TSystem>;

    if (!body || typeof body !== "object") {
        return new Response("Invalid body", { status: 400 });
    }

    const updated = await system.repository.updateSystem(body);

    return new Response(JSON.stringify(updated), {
        headers: { "Content-Type": "application/json" },
    });
}
