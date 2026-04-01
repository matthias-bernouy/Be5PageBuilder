import { Authentication, AuthRepositoryProvider, Be5_Runner } from "be5-interfaces"
import { MongoClient } from "mongodb";
import { PageBuilder } from "src/PageBuilder";
import { DefaultMediaRepository } from "src/interfaces/default-provider/Media/DefaultMediaRepository";
import { DefaultPageBuilderRepository } from "src/interfaces/default-provider/Repository/DefaultPagebuilderRepository";

const mongoClient =  await new MongoClient("mongodb://localhost:27017").connect();
const dbName = "blabla";

const BunRunnerCore = new Be5_Runner();

const PageBuilderRepository = new DefaultPageBuilderRepository(mongoClient, dbName);
const AuthRepository        = new AuthRepositoryProvider(mongoClient, dbName);
const MediaRepository       = new DefaultMediaRepository("MediaProvider 1", mongoClient, dbName, BunRunnerCore);

const AuthenticationCore = new Authentication(AuthRepository, BunRunnerCore, {
   defaultRedirection: "/page-builder/admin/pages",
   basePath: "/auth"
});

AuthenticationCore.registerDisabled = true;

await PageBuilderRepository.reset();

new PageBuilder(
    BunRunnerCore, 
    PageBuilderRepository, 
    AuthenticationCore,
    MediaRepository,
    {
        "adminPathPrefix": "",
        "clientPathPrefix": ""
    })

BunRunnerCore.start();