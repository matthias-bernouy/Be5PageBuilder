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

PageBuilderRepository.reset();
await MediaRepository.reset();

try {
    const imagesFolder = await MediaRepository.createFolder("new-folder")
    const jpgFolder = await MediaRepository.createFolder("jpg folder",imagesFolder.id)
    const jpgImage = await MediaRepository.upload(
        Bun.file("./image.jpg") as unknown as File,
        jpgFolder.id
    )
} catch (e){
    console.log(e)
}
 

const AuthenticationCore = new Authentication(AuthRepository, BunRunnerCore, {
   defaultRedirection: "/page-builder/admin/pages",
   basePath: "/auth"
});
AuthenticationCore.registerDisabled = true;


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