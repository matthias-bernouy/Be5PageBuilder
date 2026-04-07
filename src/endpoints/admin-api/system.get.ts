import type { PageBuilder } from "src/PageBuilder";

export default async function getSystem(req: Request, system: PageBuilder) {
    const settings = await system.repository.getSystem();

    return new Response(JSON.stringify(settings), {
        headers: { "Content-Type": "application/json" },
    });
}
