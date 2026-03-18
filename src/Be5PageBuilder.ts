import { Be5System, type RunnerConstructor } from "be5-system";
import { registerEndpoints } from "./target/endpoints/registerEndpoints";
import { Database } from "be5-database-interface";
import { PageModel } from "src/target/data/model/PageModel";
import { BlocModel } from "src/target/data/model/BlocModel";
import { SystemModel } from "./target/data/model/SystemModel";
import type { IBe5_Authentication, IBe5_Database, IBe5_DatabaseBuilder, IBe5_Runner } from "be5-interfaces";

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

export class Be5PageBuilder{

    private configuration: Configuration;
    private database?: IBe5_Database;
    public runner: IBe5_Runner;
    public auth: IBe5_Authentication;

    constructor(runner: IBe5_Runner, database: IBe5_DatabaseBuilder, auth: IBe5_Authentication, configuration: Configuration){
        this.configuration = configuration;
        this.auth = auth;
        this.runner = runner;
        database.addSchema(PageModel);
        database.addSchema(BlocModel);
        database.addSchema(SystemModel);
        database.afterInit((db) => {
            this.database = db;
            registerEndpoints(this);
        })
    }

    get db(){
        if ( !this.database ) throw new Error("Database isn't Initialized");
        return this.database;
    }

}