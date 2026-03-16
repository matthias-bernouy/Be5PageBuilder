import { Be5System, type RunnerConstructor } from "be5-system";
import { registerEndpoints } from "./target/endpoints/registerEndpoints";
import { Database } from "be5-database-interface";
import { PageModel } from "src/target/data/model/PageModel";
import { BlocModel } from "src/target/data/model/BlocModel";

type Configuration = {
    adminRootPath: string;
}

type MediaProvider = {
    name: string;
    paginationGetter: (page: number, size: number) => MediaDefinition[];
    getSpecificSize: (src: string, ...opts: any) => string; // return the src
    registerMedia: (alt: string, label: string, content: Uint8Array) => string // return the src
}

type MediaDefinition = {
    alt: string;
    label: string;
    originalSize: {
        width: number;
        height: number;
    }
    src: string;
}

export class Be5PageBuilder extends Be5System{

    private configuration: Configuration;

    private database = new Database([
        PageModel,
        BlocModel
    ])

    private mediaProviders: MediaProvider[];

    constructor(runner: RunnerConstructor, configuration: Configuration){
        super(runner);
        this.mediaProviders = [];
        this.configuration = configuration;
        registerEndpoints(this);
    }

    getDatabase(){
        return this.database;
    }

    getMediaProviders(){
        return this.mediaProviders;
    }

    addMediaProvider(props: MediaProvider){
        this.mediaProviders.push(props);
    }

}