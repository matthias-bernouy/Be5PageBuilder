import { registerEndpoints } from "./endpoints/registerEndpoints";
import type { Authentication, Runner } from "@bernouy/socle";
import type { CmsRepository } from "./contracts/Repository/CmsRepository";
import type { MediaRepository } from "./contracts/Media/MediaRepository";
import type { Cache } from "./contracts/Cache/Cache";
import type { TPage, TPageRef } from "./contracts/Repository/TModels";
import { InMemoryCache } from "./providers/memory/Cache/InMemoryCache";
import { cachedResponseAsync } from "./server/compression";
import { renderPage } from "./server/rendering/renderPage";
import { isReservedPath } from "./server/reservedPaths";
import { isValidPathFormat } from "./utils/validation";
import { ImageOptimizer } from "./server/imageOptimization/ImageOptimizer";
import { P9R_CACHE } from "src/constants/p9r-constants";
import type { CMS_ROLES } from "types/roles";

type Configuration = {
    adminPathPrefix?: string;
    clientPathPrefix?: string;
}

export class Cms{

    private configuration: Configuration;
    private _repository: CmsRepository;
    private _runner:     Runner;
    private _auth:       Authentication;
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
        repository: CmsRepository,
        auth: Authentication<CMS_ROLES>,
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
        const cacheKey = P9R_CACHE.page(cachePath, cacheIdentifier);
        // The in-memory cache is wiped on every server restart, so the first
        // visitor to a page after a restart would otherwise get the
        // un-optimized HTML forever (optimization is only kicked off from the
        // save endpoint). Detect the miss and re-enqueue so the next request
        // gets the srcset-rewritten version.
        const wasCached = this._cache.get(cacheKey) !== null;

        try {
            const response = await cachedResponseAsync(
                req,
                cacheKey,
                this._cache,
                () => renderPage(page, this)
            );

            if (!wasCached) {
                const origin = new URL(req.url).origin;
                this._imageOptimizer.enqueuePageOptimization(cachePath, cacheIdentifier, origin);
            }

            return response;
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
