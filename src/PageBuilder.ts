import { registerEndpoints } from "./endpoints/registerEndpoints";
import type { Authentication, PasswordAuthentication, Runner, TokenAuthentication } from "@bernouy/socle";
import type { PageBuilderRepository } from "./interfaces/contract/Repository/PageBuilderRepository";
import type { MediaRepository } from "./interfaces/contract/Media/MediaRepository";
import type { Cache } from "./interfaces/contract/Cache/Cache";
import type { TPage, TPageRef } from "./interfaces/contract/Repository/TModels";
import { InMemoryCache } from "./interfaces/default-provider/Cache/InMemoryCache";
import { cachedResponseAsync } from "./server/compression";
import { renderPage } from "./server/renderPage";
import { isReservedPath, isValidPathFormat } from "./server/reservedPaths";
import { ImageOptimizer } from "./server/imageOptimization/ImageOptimizer";
import { P9R_CACHE } from "types/p9r-constants";

type Configuration = {
    adminPathPrefix?: string;
    clientPathPrefix?: string;
}

export class PageBuilder{

    private configuration: Configuration;
    private _repository: PageBuilderRepository;
    private _runner:     Runner;
    private _auth:       Authentication & TokenAuthentication & PasswordAuthentication;
    private _mediaRepository: MediaRepository;
    private _cache:      Cache;
    private _imageOptimizer: ImageOptimizer;

    /**
     * Set of paths for which a dynamic GET route has already been registered
     * on the runner. Be5_Runner has no `removeEndpoint`, so once a path is in
     * here it stays (the handler looks up the page in the DB at request time,
     * so a stale entry just 404s gracefully).
     */
    private _registeredPagePaths: Set<string> = new Set();

    constructor(
        runner: Runner,
        repository: PageBuilderRepository,
        auth: Authentication & TokenAuthentication & PasswordAuthentication,
        mediaRepository: MediaRepository,
        configuration: Configuration,
        cache?: Cache
    ){
        this.configuration = configuration;
        this._auth = auth;
        this._runner = runner;
        this._repository = repository;
        this._mediaRepository = mediaRepository;
        this._cache = cache || new InMemoryCache();
        this._imageOptimizer = new ImageOptimizer(this);
        registerEndpoints(this);
        this.registerHomeRoute();
        this.hydratePageRoutes().catch(err => {
            console.error("Failed to hydrate page routes from DB:", err);
        });
    }

    get mediaRepository(){
        return this._mediaRepository;
    }

    get config(){
        return this.configuration;
    }

    get repository(){
        return this._repository;
    }

    get auth(){
        return this._auth;
    }

    get runner(){
        return this._runner;
    }

    get cache(){
        return this._cache;
    }

    get imageOptimizer(){
        return this._imageOptimizer;
    }

    /**
     * Register a GET route for a page path if it hasn't been registered yet.
     * The shared handler reads `?identifier=` at request time so multiple
     * page variants sharing the same path are all served by a single route.
     *
     * Silently ignores reserved paths and malformed paths — callers should
     * validate before calling, but this guards against bad state anyway.
     */
    registerPageRoute(path: string): void {
        if (!isValidPathFormat(path)) return;
        if (isReservedPath(path, this)) return;
        if (this._registeredPagePaths.has(path)) return;

        this._registeredPagePaths.add(path);

        this._runner.addEndpoint("GET", path, (req: Request) => this.handlePageRequest(req));
    }

    /**
     * Register `GET /` so the home page can be picked in settings. Prefers a
     * real page with literal path `/` if one exists; otherwise resolves the
     * `site.home` reference. Always registered so the user can configure a
     * home without creating a page at `/`.
     */
    private registerHomeRoute(): void {
        if (this._registeredPagePaths.has("/")) return;
        this._registeredPagePaths.add("/");

        this._runner.addEndpoint("GET", "/", async (req: Request) => {
            const url = new URL(req.url);
            const identifier = url.searchParams.get("identifier") || "";

            // A literal page at `/` always wins over the home ref.
            const direct = await this._repository.getPage("/", identifier);
            if (direct) {
                return this.renderWithFallbacks(req, direct, "/", identifier);
            }

            const settings = await this._repository.getSystem();
            const homeRef = settings.site?.home;
            if (homeRef) {
                const target = await this._repository.getPage(homeRef.path, homeRef.identifier);
                if (target) {
                    // Cache under `/` so edits to the referenced page don't
                    // poison the home cache — its own route invalidates its
                    // own key, and editing settings invalidates `/`.
                    return this.renderWithFallbacks(req, target, "/", "");
                }
            }

            return this.renderNotFound(req);
        });
    }

    /**
     * Shared entry point for every dynamic page GET. Looks up the (path,
     * identifier) pair and either renders it through the cache, falls back to
     * the configured 404 page, or falls back to the configured 500 page on
     * render failure.
     */
    private async handlePageRequest(req: Request): Promise<Response> {
        const url = new URL(req.url);
        const identifier = url.searchParams.get("identifier") || "";
        const page = await this._repository.getPage(url.pathname, identifier);
        if (!page) return this.renderNotFound(req);

        return this.renderWithFallbacks(req, page, url.pathname, identifier);
    }

    /**
     * Renders a page through the cache and catches render errors so the
     * configured 500 fallback (or a plain text fallback) takes over.
     */
    private async renderWithFallbacks(
        req: Request,
        page: TPage,
        cachePath: string,
        cacheIdentifier: string
    ): Promise<Response> {
        try {
            return await cachedResponseAsync(
                req,
                P9R_CACHE.page(cachePath, cacheIdentifier),
                this._cache,
                () => renderPage(page, this)
            );
        } catch (err) {
            console.error(`Failed to render page ${cachePath}?${cacheIdentifier}:`, err);
            return this.renderServerError(req);
        }
    }

    /**
     * Resolve `site.notFound` and render it, or fall back to plain text. The
     * fallback page itself is rendered through `renderPage` without its own
     * error wrapper — if it throws, we return plain text to avoid recursion.
     */
    private async renderNotFound(req: Request): Promise<Response> {
        return this.renderRef(req, "notFound", 404, "Page not found");
    }

    private async renderServerError(req: Request): Promise<Response> {
        return this.renderRef(req, "serverError", 500, "Internal server error");
    }

    private async renderRef(
        req: Request,
        field: "notFound" | "serverError",
        status: number,
        fallbackText: string
    ): Promise<Response> {
        try {
            const settings = await this._repository.getSystem();
            const ref: TPageRef = settings.site?.[field] ?? null;
            if (ref) {
                const page = await this._repository.getPage(ref.path, ref.identifier);
                if (page) {
                    // renderPage returns a CacheEntry (pre-compressed). Build
                    // a Response honoring the client's accept-encoding, and
                    // override the status so the client sees a real 404/500.
                    const entry = await renderPage(page, this);
                    const accept = req.headers.get("accept-encoding") || "";
                    if (accept.includes("br")) {
                        return new Response(entry.brotli as BodyInit, {
                            status,
                            headers: {
                                "Content-Type": entry.contentType,
                                "Content-Encoding": "br",
                            },
                        });
                    }
                    if (accept.includes("gzip")) {
                        return new Response(entry.gzip as BodyInit, {
                            status,
                            headers: {
                                "Content-Type": entry.contentType,
                                "Content-Encoding": "gzip",
                            },
                        });
                    }
                    return new Response(entry.raw as BodyInit, {
                        status,
                        headers: { "Content-Type": entry.contentType },
                    });
                }
            }
        } catch (err) {
            console.error(`Failed to render ${field} fallback:`, err);
        }
        return new Response(fallbackText, { status });
    }

    /**
     * Iterate every page in the repository and register a route for each
     * unique path. Called once at startup — new routes added afterwards via
     * the admin API go through `registerPageRoute` directly.
     */
    private async hydratePageRoutes(): Promise<void> {
        const pages = await this._repository.getAllPages();
        const paths = new Set(pages.map(p => p.path));
        for (const path of paths) {
            this.registerPageRoute(path);
        }
    }

}
