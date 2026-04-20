import type { Cms } from "src/Cms";

export default async function deleteMedia(req: Request, cms: Cms) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return new Response("Missing id", { status: 400 });
    }

    await cms.mediaRepository.deleteItem(id);

    return new Response("Deleted", { status: 200 });
}
