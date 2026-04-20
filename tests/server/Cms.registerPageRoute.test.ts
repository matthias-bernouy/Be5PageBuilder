import { describe, test, expect, beforeEach } from "bun:test";
import { Cms } from "src/Cms";

// Build a Cms without running its heavy constructor (which would
// walk src/endpoints and hydrate routes from the DB). We only want to test
// the `registerPageRoute` idempotence + guard logic.
function makeBuilder(opts: { adminPathPrefix?: string } = {}) {
    const registered: string[] = [];
    const fakeRunner = {
        addEndpoint: (_method: string, path: string) => { registered.push(path); },
    };

    const pb = Object.create(Cms.prototype);
    pb.configuration = { adminPathPrefix: opts.adminPathPrefix ?? "/cms" };
    pb._runner = fakeRunner;
    pb._registeredPagePaths = new Set<string>();
    return { pb: pb as Cms, registered };
}

describe("Cms.registerPageRoute", () => {
    let builder: ReturnType<typeof makeBuilder>;

    beforeEach(() => {
        builder = makeBuilder();
    });

    test("registers a normal path exactly once", () => {
        builder.pb.registerPageRoute("/about");
        expect(builder.registered).toEqual(["/about"]);
    });

    test("is idempotent — a second call does nothing", () => {
        builder.pb.registerPageRoute("/about");
        builder.pb.registerPageRoute("/about");
        builder.pb.registerPageRoute("/about");
        expect(builder.registered).toEqual(["/about"]);
    });

    test("silently skips paths with invalid format", () => {
        builder.pb.registerPageRoute("about");       // no leading slash
        builder.pb.registerPageRoute("/a?b=1");       // query
        builder.pb.registerPageRoute("/a#top");       // fragment
        builder.pb.registerPageRoute("/a/:id");       // route param
        builder.pb.registerPageRoute("");             // empty
        expect(builder.registered).toEqual([]);
    });

    test("silently skips reserved paths (framework exact)", () => {
        builder.pb.registerPageRoute("/bloc");
        builder.pb.registerPageRoute("/style");
        builder.pb.registerPageRoute("/media");
        builder.pb.registerPageRoute("/font");
        builder.pb.registerPageRoute("/robots.txt");
        builder.pb.registerPageRoute("/sitemap.xml");
        expect(builder.registered).toEqual([]);
    });

    test("silently skips paths under the admin prefix", () => {
        builder.pb.registerPageRoute("/cms");
        builder.pb.registerPageRoute("/cms/pages");
        expect(builder.registered).toEqual([]);
    });

    test("honours a custom admin prefix when checking reserved paths", () => {
        const custom = makeBuilder({ adminPathPrefix: "/backend" });
        custom.pb.registerPageRoute("/backend");
        custom.pb.registerPageRoute("/backend/foo");
        custom.pb.registerPageRoute("/cms"); // not reserved under /backend
        expect(custom.registered).toEqual(["/cms"]);
    });

    test("independent paths are registered independently", () => {
        builder.pb.registerPageRoute("/about");
        builder.pb.registerPageRoute("/contact");
        builder.pb.registerPageRoute("/docs/getting-started");
        expect(builder.registered).toEqual(["/about", "/contact", "/docs/getting-started"]);
    });
});
