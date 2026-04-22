import type { ControlCms } from "src/control/ControlCms";

export default async function postFolder(req: Request, cms: ControlCms) {
    
    const data = await req.json();

    await cms.mediaRepository.createFolder(data.label, data.parent);

    return new Response("Folder created");
}