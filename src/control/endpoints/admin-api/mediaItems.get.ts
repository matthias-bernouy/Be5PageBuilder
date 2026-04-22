import type { ControlCms } from "src/control/ControlCms";

export default async function mediaItems(req: Request, cms: ControlCms) {
    const url = new URL(req.url);

    const parent = url.searchParams.get("parent") || undefined;
    const typesParam = url.searchParams.get("types");

    let allowedTypes: ("folder" | "image" | "other")[] = ["image", "other"];

    if (typesParam) {
        try {
            const parsed = JSON.parse(typesParam);
            if (Array.isArray(parsed)) {
                allowedTypes = parsed;
            }
        } catch (e) {
            console.warn("Invalid types format received:", typesParam);
        }
    }

    const finalFilterTypes = Array.from(new Set([...allowedTypes, "folder"]));

    const items = await cms.mediaRepository.getItems(parent, {
        type: finalFilterTypes as ("folder" | "image" | "other")[]
    });

    return new Response(JSON.stringify(items), {
        headers: { "Content-Type": "application/json" }
    });
}