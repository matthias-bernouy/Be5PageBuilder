import { describe, test, expect } from "bun:test";

// We test the public `/media` handler registered by MediaEndpoints. It serves
// user-uploaded bytes with the user-provided mimetype — a SVG containing
// <script> will execute in the page origin when fetched by <img src> users
// follow, or when opened in a new tab.
import MediaEndpoints from "src/interfaces/default-provider/Media/MediaEndpoints";

function makeRunner() {
    const handlers = new Map<string, (req: Request) => Promise<Response>>();
    return {
        handlers,
        get: (path: string, fn: (req: Request) => Promise<Response>) => {
            handlers.set("GET " + path, fn);
        },
    } as any;
}

const SVG_XSS = `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`;

describe("media SVG upload must not execute scripts", () => {
    test("SVG served with script content is either sanitized or hardened", async () => {
        const runner = makeRunner();
        const system: any = {
            getItem: async () => ({
                type: "image",
                mimetype: "image/svg+xml",
                label: "evil.svg",
                content: Buffer.from(SVG_XSS),
            }),
        };
        MediaEndpoints(runner, system);

        const handler = runner.handlers.get("GET /media")!;
        const res = await handler(new Request("http://x/media?id=1"));
        const body = await res.text();

        const hasScript = /<script/i.test(body);
        const hasAttachment = (res.headers.get("Content-Disposition") || "").includes("attachment");
        const hasCSP = !!res.headers.get("Content-Security-Policy");

        // Safe iff the bytes are sanitized (no <script>) OR the response is
        // forced as a download OR a strict CSP blocks inline execution.
        expect(!hasScript || hasAttachment || hasCSP).toBe(true);
    });

    test("served mimetype is restricted to a safe allow-list", async () => {
        const runner = makeRunner();
        const system: any = {
            getItem: async () => ({
                type: "image",
                mimetype: "text/html",           // dangerous — should never be served
                label: "evil.html",
                content: Buffer.from("<script>alert(1)</script>"),
            }),
        };
        MediaEndpoints(runner, system);

        const handler = runner.handlers.get("GET /media")!;
        const res = await handler(new Request("http://x/media?id=1"));
        const ct = res.headers.get("Content-Type") || "";
        expect(ct.startsWith("image/")).toBe(true);
    });
});
