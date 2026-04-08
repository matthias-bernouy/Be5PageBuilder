import type { PageBuilder } from "src/PageBuilder";

export default async function patchMediaItem(req: Request, system: PageBuilder) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return new Response("Missing id", { status: 400 });
    }

    const data = await req.json();

    await system.mediaRepository.updateMetadata(id, data);

    return new Response("Updated", { status: 200 });
}
