import type { PageBuilder } from "src/PageBuilder";

export default async function postMedia(req: Request, system: PageBuilder) {
    const data = await req.formData();

    const file = data.get("file");
    const parentEntry = data.get("parent");

    if (!file || !(file instanceof File)) {
        return new Response("Missing or invalid argument 'file'", {
            status: 400
        });
    }

    const parent = typeof parentEntry === "string" ? parentEntry : undefined;

    try {
        const uploadedItem = await system.mediaRepository.upload(file, parent);

        return new Response(JSON.stringify(uploadedItem), {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        console.error("Upload error:", err);
        return new Response("Upload failed", { status: 500 });
    }
}