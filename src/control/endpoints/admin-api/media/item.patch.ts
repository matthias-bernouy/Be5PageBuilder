import type { ControlCms } from "src/control/ControlCms";

export default async function patchMediaItem(req: Request, cms: ControlCms) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return new Response("Missing id", { status: 400 });
    }

    const data = await req.json();

    await cms.mediaRepository.updateMetadata(id, data);

    return new Response("Updated", { status: 200 });
}
