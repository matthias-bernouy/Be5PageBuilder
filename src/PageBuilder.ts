import { registerEndpoints } from "./endpoints/registerEndpoints";
import { PageModel } from "src/data/model/PageModel";
import { BlocModel } from "src/data/model/BlocModel";
import { SystemModel } from "./data/model/SystemModel";
import type { IBe5_Authentication, IBe5_Database, IBe5_DatabaseBuilder, IBe5_Runner } from "be5-interfaces";

type Configuration = {
    adminPathPrefix?: string;
    clientPathPrefix?: string;
}

export class PageBuilder{

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

    get config(){
        return this.configuration;
    }

    get db(){
        if ( !this.database ) throw new Error("Database isn't Initialized");
        return this.database;
    }

}