import { describe, test, expect } from "bun:test";
import postMedia from "src/endpoints/admin-api/media/file.post";

function makeSystem(captureMime: { value?: string }) {
    return {
        mediaRepository: {
            upload: async (file: File) => {
                captureMime.value = file.type;
                return { id: "x", type: "image", label: file.name, mimetype: file.type };
            },
        },
    } as any;
}

function makeReq(file: File) {
    const form = new FormData();
    form.append("file", file);
    return new Request("http://x/cms/api/media/file", { method: "POST", body: form });
}

describe("media upload validation", () => {
    test("rejects dangerous mime types", async () => {
        const bad = ["text/html", "application/javascript", "application/x-msdownload", "text/x-shellscript"];
        for (const type of bad) {
            const captured: { value?: string } = {};
            const file = new File(["malicious"], "x", { type });
            const res = await postMedia(makeReq(file), makeSystem(captured));
            expect(res.status).toBeGreaterThanOrEqual(400);
        }
    });

    test("rejects oversized files", async () => {
        const captured: { value?: string } = {};
        // 50MB of zeros — should be above the limit (20MB is a reasonable cap).
        const big = new File([new Uint8Array(50 * 1024 * 1024)], "huge.png", { type: "image/png" });
        const res = await postMedia(makeReq(big), makeSystem(captured));
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test("normalizes / strips path components in filenames", async () => {
        const captured: { value?: string } = {};
        const file = new File(["x"], "../../etc/passwd", { type: "image/png" });
        const res = await postMedia(makeReq(file), makeSystem(captured));
        // Either reject up-front or the stored label must never contain "../".
        if (res.status < 400) {
            const body = await res.json();
            expect(body.label).not.toContain("..");
            expect(body.label).not.toContain("/");
        }
    });
});
