import { describe, test, expect } from "bun:test";
import { compress, sendCompressed } from "src/control/server/compression";
import { send_html } from "src/control/server/send_html";

function runner() {
    const handlers = new Map<string, (req: Request) => Promise<Response>>();
    return {
        handlers,
        get: (p: string, fn: any) => { handlers.set("GET " + p, fn); },
    } as any;
}

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

describe("CSP is only emitted on HTML responses", () => {
    test("HTML responses carry Content-Security-Policy (enforcing)", () => {
        const entry = compress("<html></html>", "text/html");
        const req = new Request("http://x/", { headers: { "accept-encoding": "" } });
        const res = sendCompressed(req, entry);
        const csp = res.headers.get("Content-Security-Policy");
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("style-src 'self' 'unsafe-inline'");
        expect(csp).toContain("img-src 'self' data: https:");
        expect(csp).toContain("frame-ancestors 'none'");
        expect(csp).toContain("object-src 'none'");
        // Report-Only must not be present now that we're enforcing.
        expect(res.headers.get("Content-Security-Policy-Report-Only")).toBe(null);
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
        expect(res.headers.get("Content-Security-Policy")).toBe(null);
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

    test("send_html carries enforcing Content-Security-Policy", () => {
        const res = send_html("<!doctype html><html></html>");
        expect(res.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
        expect(res.headers.get("Content-Security-Policy-Report-Only")).toBe(null);
    });
});
