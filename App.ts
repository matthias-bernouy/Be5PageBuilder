import { Authentication, AuthRepositoryProvider, Be5_Runner } from "be5-interfaces"
import { PageBuilder } from "src/PageBuilder";
import { DefaultPageBuilderRepository } from "src/interfaces/default-provider/Repository/DefaultPagebuilderRepository";

const DatastorePageBuilder = await DefaultPageBuilderRepository.create({
    uri: "mongodb://localhost:27017",
    databaseName: "my_db"
});

const DatastoreAuthentication = await AuthRepositoryProvider.create({
    uri: "mongodb://localhost:27017",
    databaseName: "my_db"
})

const BunRunnerCore = new Be5_Runner();

const AuthenticationCore = new Authentication(DatastoreAuthentication, BunRunnerCore, {
   defaultRedirection: "/page-builder/admin/pages",
   basePath: "/auth"
});

AuthenticationCore.registerDisabled = true;

new PageBuilder(BunRunnerCore, DatastorePageBuilder, AuthenticationCore, {
    "adminPathPrefix": "",
    "clientPathPrefix": ""
})

BunRunnerCore.start();