import type { Cms } from "src/Cms";

export default async function postFolder(req: Request, cms: Cms) {
    
    const data = await req.json();

    await cms.mediaRepository.createFolder(data.label, data.parent);

    return new Response("Folder created");
}