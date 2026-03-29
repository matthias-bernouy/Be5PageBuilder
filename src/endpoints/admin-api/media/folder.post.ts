import type { PageBuilder } from "src/PageBuilder";

export default async function postFolder(req: Request, system: PageBuilder) {
    
    const data = await req.json();

    await system.mediaRepository.createFolder(data.label, data.parent);

    return new Response("Folder created");
}