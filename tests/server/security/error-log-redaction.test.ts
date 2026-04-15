import { describe, test, expect, spyOn } from "bun:test";
import postMedia from "src/endpoints/admin-api/media/file.post";

describe("error logs do not leak raw error objects in production paths", () => {
    test("upload error logs a short message, not the whole Error object with stack", async () => {
        const errSpy = spyOn(console, "error").mockImplementation(() => {});
        try {
            const sensitive = new Error("Mongo: failed at /secret/path user=admin token=hunter2");
            (sensitive as any).stack =
                "Error: leaks\n    at /abs/fs/secret-path.ts:12:3\n    password=hunter2";

            const system: any = {
                mediaRepository: { upload: async () => { throw sensitive; } },
            };
            const form = new FormData();
            form.append("file", new File(["x"], "a.png", { type: "image/png" }));
            await postMedia(
                new Request("http://x/", { method: "POST", body: form }),
                system,
            );

            const logged = errSpy.mock.calls.flat().join(" ");
            expect(logged).not.toContain("hunter2");
            expect(logged).not.toContain("/secret/path");
        } finally {
            errSpy.mockRestore();
        }
    });
});
