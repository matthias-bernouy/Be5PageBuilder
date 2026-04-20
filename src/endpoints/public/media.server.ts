import type { Cms } from "src/Cms";


export async function MediaServer(req: Request, cms: Cms){

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id){
        return new Response("Missing argument 'id'", {
            status: 400
        })
    }

    const w = url.searchParams.get("w");
    const h = url.searchParams.get("h");


    const response = cms.mediaRepository.getResponse(id, {
        w: w ? parseInt(w) : undefined,
        h: h ? parseInt(h) : undefined,
    })

    return response;

}