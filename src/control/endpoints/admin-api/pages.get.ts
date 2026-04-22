import type { ControlCms } from "src/control/ControlCms";

export default async function getPages(_req: Request, cms: ControlCms) {
    const pages = await cms.repository.getAllPages();

    const links = pages
        .filter(page => page.visible)
        .map(page => ({
            title: page.title,
            path: page.identifier
                ? `${page.path}?identifier=${encodeURIComponent(page.identifier)}`
                : page.path
        }));

    return new Response(JSON.stringify(links), {
        headers: { "Content-Type": "application/json" }
    });
}
