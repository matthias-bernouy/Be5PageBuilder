import { registerEndpoints } from "./endpoints/registerEndpoints";
import type { IBe5_Authentication, IBe5_Runner } from "be5-interfaces";
import type { PageBuilderRepository } from "./interfaces/contract/Repository/PageBuilderRepository";
import type { MediaRepository } from "./interfaces/contract/Media/MediaRepository";

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

    constructor(
        runner: IBe5_Runner,
        repository: PageBuilderRepository,
        auth: IBe5_Authentication,
        mediaRepository: MediaRepository,
        configuration: Configuration
    ){
        this.configuration = configuration;
        this._auth = auth;
        this._runner = runner;
        this._repository = repository;
        this._mediaRepository = mediaRepository;
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

}