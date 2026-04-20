import type { Cms } from "src/Cms";

export default async function deleteTemplate(req: Request, cms: Cms) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return new Response("Missing id", { status: 400 });

    await cms.repository.deleteTemplate(id);
    return new Response("Deleted", { status: 200 });
}
