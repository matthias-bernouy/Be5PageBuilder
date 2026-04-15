import { describe, test, expect } from "bun:test";
import BlocServer from "src/endpoints/public/bloc.server";
import MediaEndpoints from "src/interfaces/default-provider/Media/MediaEndpoints";

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
