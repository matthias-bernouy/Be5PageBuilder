import type { MediaDocument, MediaImage } from "src/contracts/Media/MediaRepository";
import type { Cms } from "src/Cms";

export default async function getMediaItem(req: Request, cms: Cms) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return new Response("Missing id", { status: 400 });
    }

    const item = await cms.mediaRepository.getItem(id) as MediaImage | MediaDocument | null;

    if (!item) {
        return new Response("Not found", { status: 404 });
    }

    

    const { content, ...rest } = item;

    return new Response(JSON.stringify(rest), {
        headers: { "Content-Type": "application/json" }
    });
}
