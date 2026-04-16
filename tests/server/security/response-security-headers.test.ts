import { describe, test, expect } from "bun:test";
import BlocServer from "src/endpoints/public/bloc.server";
import MediaEndpoints from "src/interfaces/default-provider/Media/MediaEndpoints";
import { compress, sendCompressed } from "src/server/compression";
import { send_html } from "src/server/send_html";

function runner() {
    const handlers = new Map<string, (req: Request) => Promise<Response>>();
    return {
        handlers,
        get: (p: string, fn: any) => { handlers.set("GET " + p, fn); },
    } as any;
}

describe("security headers on public responses", () => {
    test("/bloc responses carry X-Content-Type-Options: nosniff", async () => {
        const system: any = {
            repository: { getBlocViewJS: async () => "/*v*/" },
            cache: {
                get: () => null,
                set: (_k: string, v: any) => v,
                delete: () => {},
            },
        };
        const res = await BlocServer(new Request("http://x/bloc?tag=my-card"), system);
        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });

    test("/media responses carry X-Content-Type-Options: nosniff", async () => {
        const r = runner();
        MediaEndpoints(r, {
            getItem: async () => ({ type: "image", mimetype: "image/png", content: Buffer.from("x"), label: "a.png" }),
        } as any);
        const handler = r.handlers.get("GET /media")!;
        const res = await handler(new Request("http://x/media?id=1"));
        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    });
});

describe("security headers on every compressed response", () => {
    const cases: { enc: string; accept: string }[] = [
        { enc: "br",       accept: "br" },
        { enc: "gzip",     accept: "gzip" },
        { enc: "identity", accept: "" },
    ];

    for (const { enc, accept } of cases) {
        test(`full security header set is present (${enc})`, () => {
            const entry = compress("hello", "text/plain");
            const req = new Request("http://x/", { headers: { "accept-encoding": accept } });
            const res = sendCompressed(req, entry);

            expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
            expect(res.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
            expect(res.headers.get("X-Frame-Options")).toBe("DENY");
            expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
            expect(res.headers.get("Permissions-Policy")).toContain("camera=()");
            expect(res.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
            expect(res.headers.get("Cross-Origin-Resource-Policy")).toBe("same-origin");
        });
    }
});

describe("CSP Report-Only is only emitted on HTML responses", () => {
    test("HTML responses carry Content-Security-Policy-Report-Only", () => {
        const entry = compress("<html></html>", "text/html");
        const req = new Request("http://x/", { headers: { "accept-encoding": "" } });
        const res = sendCompressed(req, entry);
        const csp = res.headers.get("Content-Security-Policy-Report-Only");
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("style-src 'self' 'unsafe-inline'");
        expect(csp).toContain("frame-ancestors 'none'");
        expect(csp).toContain("object-src 'none'");
    });

    test("Non-HTML responses do NOT carry a CSP header (meaningless on assets)", () => {
        const entry = compress("/*css*/", "text/css");
        const req = new Request("http://x/", { headers: { "accept-encoding": "" } });
        const res = sendCompressed(req, entry);
        expect(res.headers.get("Content-Security-Policy-Report-Only")).toBe(null);
        expect(res.headers.get("Content-Security-Policy")).toBe(null);
    });

    test("Bloc bundle (application/javascript) does NOT carry CSP", () => {
        const entry = compress("/*js*/", "application/javascript");
        const req = new Request("http://x/", { headers: { "accept-encoding": "" } });
        const res = sendCompressed(req, entry);
        expect(res.headers.get("Content-Security-Policy-Report-Only")).toBe(null);
    });
});

describe("security headers on admin HTML responses (send_html)", () => {
    test("send_html carries the full security header set", () => {
        const res = send_html("<!doctype html><html></html>");
        expect(res.headers.get("Content-Type")).toBe("text/html");
        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(res.headers.get("Strict-Transport-Security")).toBe("max-age=31536000");
        expect(res.headers.get("X-Frame-Options")).toBe("DENY");
        expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
        expect(res.headers.get("Permissions-Policy")).toContain("camera=()");
        expect(res.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
        expect(res.headers.get("Cross-Origin-Resource-Policy")).toBe("same-origin");
    });

    test("send_html carries Content-Security-Policy-Report-Only", () => {
        const res = send_html("<!doctype html><html></html>");
        expect(res.headers.get("Content-Security-Policy-Report-Only")).toContain(
            "default-src 'self'"
        );
    });
});
