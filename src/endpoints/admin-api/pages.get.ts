import type { PageBuilder } from "src/PageBuilder";

export default async function getPages(_req: Request, system: PageBuilder) {
    const pages = await system.repository.getAllPages();

    const links = pages
        .filter(page => page.visible)
        .map(page => ({
            title: page.title,
            path: page.path + "?identifier=" + page.identifier
        }));

    return new Response(JSON.stringify(links), {
        headers: { "Content-Type": "application/json" }
    });
}
