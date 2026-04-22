import { describe, test, expect } from "bun:test";
import { DefaultMediaRepository } from "src/socle/providers/mongo/Media/DefaultMediaRepository";

describe("media filename header injection", () => {
    test("Content-Disposition filename is safely encoded", async () => {
        // Call getResponse with a media doc whose label contains a quote, CRLF,
        // and non-ASCII chars. The filename MUST be encoded (RFC 5987 / 6266),
        // not raw-interpolated.
        const repo = Object.create(DefaultMediaRepository.prototype) as any;
        const media = {
            id: "1",
            type: "image",
            label: `evil"\r\nX-Injected: 1\r\n.png`,
            mimetype: "image/png",
            content: Buffer.from("x"),
        };

        // getResponse is instance-level; fake `this` just enough.
        const res: Response = await (DefaultMediaRepository.prototype as any).getResponse.call(repo, media);
        const disposition = res.headers.get("Content-Disposition") || "";

        expect(disposition).not.toContain("\r");
        expect(disposition).not.toContain("\n");
        expect(disposition).not.toMatch(/X-Injected/i);
        // Either no quote is passed through raw, or the filename uses RFC 5987 form.
        const safe =
            !disposition.includes(`"evil"`) ||
            /filename\*=UTF-8''/i.test(disposition);
        expect(safe).toBe(true);
    });
});
