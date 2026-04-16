import type { PageBuilder } from "src/PageBuilder";

const ALLOWED_MIMES = new Set([
    "image/png", "image/jpeg", "image/gif", "image/webp", "image/avif", "image/svg+xml",
    "video/mp4", "video/webm", "video/ogg",
    "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm",
    "application/pdf",
    "font/woff", "font/woff2", "font/ttf", "font/otf",
]);
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

function sanitizeFilename(name: string): string {
    // Strip any path components — keep only the basename, drop leading dots.
    const base = name.replace(/\\/g, "/").split("/").pop() || "file";
    return base.replace(/^\.+/, "").slice(0, 255) || "file";
}

export default async function postMedia(req: Request, system: PageBuilder) {
    const data = await req.formData();

    const file = data.get("file");
    const parentEntry = data.get("parent");

    if (!file || !(file instanceof File)) {
        return new Response("Missing or invalid argument 'file'", {
            status: 400
        });
    }

    if (!ALLOWED_MIMES.has(file.type)) {
        return new Response(`Unsupported mime type "${file.type}"`, { status: 415 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
        return new Response("File too large", { status: 413 });
    }

    const parent = typeof parentEntry === "string" ? parentEntry : undefined;

    const safeName = sanitizeFilename(file.name);
    const safeFile = safeName === file.name
        ? file
        : new File([await file.arrayBuffer()], safeName, { type: file.type });

    try {
        const uploadedItem = await system.mediaRepository.upload(safeFile, parent);

        return new Response(JSON.stringify(uploadedItem), {
            status: 201,
            headers: { "Content-Type": "application/json" }
        });
    } catch {
        console.error("Upload error");
        return new Response("Upload failed", { status: 500 });
    }
}