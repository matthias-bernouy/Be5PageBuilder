import type { PageBuilder } from "src/PageBuilder";

export default async function deleteMedia(req: Request, system: PageBuilder) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return new Response("Missing id", { status: 400 });
    }

    await system.mediaRepository.deleteItem(id);

    return new Response("Deleted", { status: 200 });
}
