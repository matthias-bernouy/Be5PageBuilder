import type { PageBuilder } from "src/PageBuilder";

/**
 * Lightweight bloc metadata endpoint. Returns `{id, name, group, description}`
 * for every registered bloc — no compiled JS payloads. Consumed by
 * `p9r list-blocs` so external agents can discover what blocs exist without
 * hallucinating tags.
 */
export default async function getBlocsList(_req: Request, system: PageBuilder) {
    const blocs = await system.repository.getBlocsList();
    return new Response(JSON.stringify(blocs), {
        headers: { "Content-Type": "application/json" },
    });
}
