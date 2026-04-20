import type { Cms } from "src/Cms";

export default async function patchMediaItem(req: Request, cms: Cms) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return new Response("Missing id", { status: 400 });
    }

    const data = await req.json();

    await cms.mediaRepository.updateMetadata(id, data);

    return new Response("Updated", { status: 200 });
}
