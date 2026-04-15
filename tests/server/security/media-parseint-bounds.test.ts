import { describe, test, expect } from "bun:test";
import MediaEndpoints from "src/interfaces/default-provider/Media/MediaEndpoints";

function runner() {
    const handlers = new Map<string, (req: Request) => Promise<Response>>();
    return {
        handlers,
        get: (p: string, fn: any) => { handlers.set("GET " + p, fn); },
    } as any;
}

describe("/media width/height parsing is validated", () => {
    const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        "base64",
    );

    test.each([
        "-1",
        "0",
        "NaN",
        "99999999",
        "0x1337",
        "1e9",
    ])("rejects invalid width %p with 400", async (w) => {
        const r = runner();
        MediaEndpoints(r, {
            getItem: async () => ({ type: "image", mimetype: "image/png", content: png, label: "a.png" }),
        } as any);
        const handler = r.handlers.get("GET /media")!;
        const res = await handler(new Request(`http://x/media?id=1&w=${encodeURIComponent(w)}`));
        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});
