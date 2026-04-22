import { registerEndpoints } from "./endpoints/registerEndpoints";
import type { Authentication, Runner } from "@bernouy/socle";
import type { CmsRepository } from "../socle/contracts/Repository/CmsRepository";
import type { MediaRepository } from "../socle/contracts/Media/MediaRepository";
import type { Cache } from "../socle/contracts/Cache/Cache";
import { InMemoryCache } from "../socle/providers/memory/Cache/InMemoryCache";
import type { CMS_ROLES } from "types/roles";

type Configuration = {
    adminPathPrefix?: string;
    clientPathPrefix?: string;
    /**
     * Absolute URL to the external token management interface. Surfaced on
     * the admin Profile page as the "Manage tokens" button; left undefined
     * keeps the button disabled. Deliberately a CMS-level config rather than
     * pulled from `auth.profileUrl` because that Socle contract is too
     * ambiguous (profile vs tokens vs account management).
     */
    tokensUrl?: string;
}

export class ControlCms{

    private configuration:    Configuration;
    private _repository:      CmsRepository;
    private _runner:          Runner;
    private _auth:            Authentication;
    private _mediaRepository: MediaRepository;
    private _cache:           Cache;

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
        registerEndpoints(this);
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


}
