import { registerEndpoints } from "./endpoints/registerEndpoints";
import type { IBe5_Authentication, IBe5_Runner } from "be5-interfaces";
import type { PageBuilderRepository } from "./interfaces/contract/Repository/PageBuilderRepository";
import type { MediaRepository } from "./interfaces/contract/Media/MediaRepository";
import type { Cache } from "./interfaces/contract/Cache/Cache";
import { InMemoryCache } from "./interfaces/default-provider/Cache/InMemoryCache";
import { cachedResponseAsync } from "./server/compression";
import { pageCacheKey, renderPage } from "./server/renderPage";
import { isReservedPath, isValidPathFormat } from "./server/reservedPaths";

type Configuration = {
    adminPathPrefix?: string;
    clientPathPrefix?: string;
}

export class PageBuilder{

    private configuration: Configuration;
    private _repository: PageBuilderRepository;
    private _runner:     IBe5_Runner;
    private _auth:       IBe5_Authentication;
    private _mediaRepository: MediaRepository;
    private _cache:      Cache;

    /**
     * Set of paths for which a dynamic GET route has already been registered
     * on the runner. Be5_Runner has no `removeEndpoint`, so once a path is in
     * here it stays (the handler looks up the page in the DB at request time,
     * so a stale entry just 404s gracefully).
     */
    private _registeredPagePaths: Set<string> = new Set();

    constructor(
        runner: IBe5_Runner,
        repository: PageBuilderRepository,
        auth: IBe5_Authentication,
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

        this._runner.addEndpoint("GET", path, async (req: Request) => {
            const url = new URL(req.url);
            const identifier = url.searchParams.get("identifier") || "";
            const page = await this._repository.getPage(url.pathname, identifier);
            if (!page) return new Response("Page not found", { status: 404 });

            return cachedResponseAsync(
                req,
                pageCacheKey(url.pathname, identifier),
                this._cache,
                () => renderPage(page, this)
            );
        });
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
