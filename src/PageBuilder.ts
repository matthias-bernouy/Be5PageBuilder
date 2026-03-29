import { registerEndpoints } from "./endpoints/registerEndpoints";
import type { IBe5_Authentication, IBe5_Runner } from "be5-interfaces";
import type { IDatastore } from "./interfaces/contract/Repository/PageBuilderRepository";

type Configuration = {
    adminPathPrefix?: string;
    clientPathPrefix?: string;
}

export class PageBuilder{

    private configuration: Configuration;
    private _datastore: IDatastore;
    public runner: IBe5_Runner;
    public auth: IBe5_Authentication;

    constructor(runner: IBe5_Runner, datastore: IDatastore, auth: IBe5_Authentication, configuration: Configuration){
        this.configuration = configuration;
        this.auth = auth;
        this.runner = runner;
        this._datastore = datastore;
        registerEndpoints(this);
    }

    get config(){
        return this.configuration;
    }

    get datastore(){
        return this._datastore;
    }

}