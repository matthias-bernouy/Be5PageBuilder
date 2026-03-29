import type { IBe5_Runner } from "be5-interfaces";
import type { DefaultMediaRepository } from "./DefaultMediaRepository";
import type { MediaDocument } from "src/interfaces/contract/Media/MediaRepository";
import sharp from "sharp";



export default function MediaEndpoints(runner: IBe5_Runner, system: DefaultMediaRepository) {

    runner.get("/media", async (req: Request) => {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        const w = url.searchParams.get("w");
        const h = url.searchParams.get("h");


        if (!id) return new Response("ID missing", { status: 400 });

        const item = await system.getItem(id);

        if (!item || item.type === "folder") return new Response("Not found", { status: 404 });

        const castItem = item as MediaDocument;
        let body: Buffer | Uint8Array = castItem.content;

        if (castItem.type === "image" && (w || h)) {
            body = await sharp(castItem.content)
                .resize(
                    w ? parseInt(w) : undefined,
                    h ? parseInt(h) : undefined,
                    { fit: 'inside', withoutEnlargement: true }
                )
                .toBuffer();
        }

        return new Response(body as any, {
            status: 200,
            headers: {
                "Content-Type": castItem.mimetype,
                "Cache-Control": "public, max-age=31536000",
            }
        });
    });
}