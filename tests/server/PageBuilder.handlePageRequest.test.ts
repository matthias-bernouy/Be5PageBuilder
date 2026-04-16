import { describe, test, expect } from "bun:test";
import { PageBuilder } from "src/PageBuilder";
import { InMemoryCache } from "src/interfaces/default-provider/Cache/InMemoryCache";
import type { TPage, TPageRef, TSnippet, TSystem } from "src/interfaces/contract/Repository/TModels";

type Endpoint = { method: string; path: string; handler: (req: Request) => Promise<Response> };

function makeBuilder(opts: {
    pages?: TPage[];
    home?: TPageRef;
    notFound?: TPageRef;
    serverError?: TPageRef;
    onRender?: () => void;
} = {}) {
    const endpoints: Endpoint[] = [];
    const fakeRunner = {
        addEndpoint: (method: string, path: string, handler: (req: Request) => Promise<Response>) => {
            endpoints.push({ method, path, handler });
        },
    };

    const findPage = (path: string, identifier: string): TPage | null => {
        return (opts.pages ?? []).find(
            (p) => p.path === path && (p.identifier || "") === (identifier || ""),
        ) ?? null;
    };

    const settings: TSystem = {
        initializationStep: 0,
        site: {
            name: "Test",
            favicon: "",
            visible: true,
            host: "",
            language: "",
            theme: "",
            home: opts.home ?? null,
            notFound: opts.notFound ?? null,
            serverError: opts.serverError ?? null,
        },
        seo: { titleTemplate: "", defaultDescription: "", defaultOgImage: "" },
        editor: { layoutCategory: "" },
    };

    const repository = {
        getPage: async (path: string, identifier: string) => findPage(path, identifier),
        getAllPages: async () => opts.pages ?? [],
        getSystem: async () => settings,
        getBlocsList: async () => [],
        getSnippetByIdentifier: async (_id: string): Promise<TSnippet | null> => null,
    };

    const pb: any = Object.create(PageBuilder.prototype);
    pb.configuration = { adminPathPrefix: "/page-builder" };
    pb._runner = fakeRunner;
    pb._repository = repository;
    pb._cache = new InMemoryCache();
    pb._registeredPagePaths = new Set<string>();
    pb._imageOptimizer = { enqueuePageOptimization: () => {} };

    return { pb: pb as PageBuilder, endpoints };
}

function getHandler(endpoints: Endpoint[], path: string) {
    const ep = endpoints.find((e) => e.path === path);
    if (!ep) throw new Error(`No handler registered at ${path}`);
    return ep.handler;
}

function reqFor(path: string, query: Record<string, string> = {}): Request {
    const url = new URL(`http://localhost${path}`);
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
    return new Request(url.toString());
}

const aboutPage = (over: Partial<TPage> = {}): TPage => ({
    path: "/about",
    identifier: "",
    title: "About",
    description: "About desc",
    content: "<p>about body</p>",
    visible: true,
    tags: [],
    ...over,
});

describe("PageBuilder.handlePageRequest (via registerPageRoute)", () => {
    test("renders the matching page when one exists at (path, identifier='')", async () => {
        const { pb, endpoints } = makeBuilder({ pages: [aboutPage()] });
        pb.registerPageRoute("/about");

        const res = await getHandler(endpoints, "/about")(reqFor("/about"));
        expect(res.status).toBe(200);
        expect(await res.text()).toContain("about body");
    });

    test("disambiguates by ?identifier when multiple variants share the same path", async () => {
        const { pb, endpoints } = makeBuilder({
            pages: [
                aboutPage({ content: "<p>default</p>" }),
                aboutPage({ identifier: "v2", content: "<p>variant 2</p>" }),
            ],
        });
        pb.registerPageRoute("/about");

        const handler = getHandler(endpoints, "/about");
        const defaultRes = await handler(reqFor("/about"));
        const v2Res = await handler(reqFor("/about", { identifier: "v2" }));

        expect(await defaultRes.text()).toContain("default");
        expect(await v2Res.text()).toContain("variant 2");
    });

    test("returns 404 with plain text when no page matches and no notFound is configured", async () => {
        const { pb, endpoints } = makeBuilder({ pages: [] });
        pb.registerPageRoute("/missing");

        const res = await getHandler(endpoints, "/missing")(reqFor("/missing"));
        expect(res.status).toBe(404);
        expect(await res.text()).toBe("Page not found");
    });

    test("falls back to the configured site.notFound page when one is set", async () => {
        const notFoundPage = aboutPage({
            path: "/404",
            title: "Not found",
            content: "<p>custom 404</p>",
        });
        const { pb, endpoints } = makeBuilder({
            pages: [notFoundPage],
            notFound: { path: "/404", identifier: "" },
        });
        pb.registerPageRoute("/missing");

        const res = await getHandler(endpoints, "/missing")(reqFor("/missing"));
        expect(res.status).toBe(404);
        expect(await res.text()).toContain("custom 404");
    });
});

describe("PageBuilder.registerHomeRoute", () => {
    test("registers GET / on construction (called manually here to bypass constructor)", () => {
        const { pb, endpoints } = makeBuilder();
        (pb as any).registerHomeRoute();
        expect(endpoints.find((e) => e.path === "/")).toBeDefined();
    });

    test("a literal page at `/` wins over the configured site.home", async () => {
        const literalRoot = aboutPage({ path: "/", content: "<p>literal root</p>" });
        const otherPage = aboutPage({ path: "/about", content: "<p>about as home</p>" });
        const { pb, endpoints } = makeBuilder({
            pages: [literalRoot, otherPage],
            home: { path: "/about", identifier: "" },
        });
        (pb as any).registerHomeRoute();

        const res = await getHandler(endpoints, "/")(reqFor("/"));
        expect(await res.text()).toContain("literal root");
    });

    test("falls back to site.home when no literal `/` page exists", async () => {
        const homePage = aboutPage({ path: "/welcome", content: "<p>welcome home</p>" });
        const { pb, endpoints } = makeBuilder({
            pages: [homePage],
            home: { path: "/welcome", identifier: "" },
        });
        (pb as any).registerHomeRoute();

        const res = await getHandler(endpoints, "/")(reqFor("/"));
        expect(res.status).toBe(200);
        expect(await res.text()).toContain("welcome home");
    });

    test("returns 404 when neither a literal `/` nor a configured site.home exists", async () => {
        const { pb, endpoints } = makeBuilder();
        (pb as any).registerHomeRoute();

        const res = await getHandler(endpoints, "/")(reqFor("/"));
        expect(res.status).toBe(404);
    });

    test("registerHomeRoute is idempotent — a second call does not double-register", () => {
        const { pb, endpoints } = makeBuilder();
        (pb as any).registerHomeRoute();
        (pb as any).registerHomeRoute();
        const rootEndpoints = endpoints.filter((e) => e.path === "/");
        expect(rootEndpoints).toHaveLength(1);
    });

    test("identifier on `/` is honored when picking the literal page variant", async () => {
        const { pb, endpoints } = makeBuilder({
            pages: [
                aboutPage({ path: "/", content: "<p>default root</p>" }),
                aboutPage({ path: "/", identifier: "preview", content: "<p>preview root</p>" }),
            ],
        });
        (pb as any).registerHomeRoute();

        const handler = getHandler(endpoints, "/");
        const def = await handler(reqFor("/"));
        const prev = await handler(reqFor("/", { identifier: "preview" }));

        expect(await def.text()).toContain("default root");
        expect(await prev.text()).toContain("preview root");
    });
});
