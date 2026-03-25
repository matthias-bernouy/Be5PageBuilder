import { Be5_Authentication, Be5_MongoDB, Be5_Runner } from "be5-interfaces"
import { Be5PageBuilder } from "src/Be5PageBuilder";
import { dev_import_bloc } from "src/core/ClientComponent/creator";
import { BlocModel } from "src/target/data/model/BlocModel";

const MongoDatabaseCore = new Be5_MongoDB();
const BunRunnerCore = new Be5_Runner();
const AuthenticationCore = new Be5_Authentication(MongoDatabaseCore, BunRunnerCore, {
    defaultRedirection: "/admin/dashboard",
    basePath: "/pppp"
});

AuthenticationCore.registerDisabled = true;

const PageBuilderCore = new Be5PageBuilder(BunRunnerCore, MongoDatabaseCore, AuthenticationCore, {
    "adminPathPrefix": "",
    "clientPathPrefix": ""
})

await MongoDatabaseCore.init({
    dbName: 'azerzaerazer',
    clientUrl: 'mongodb://localhost:27017',
})

BunRunnerCore.start();


await MongoDatabaseCore.getRepository(BlocModel).nativeDelete({});

await dev_import_bloc("Navbar", PageBuilderCore);


// console.log("Starting app...")

// const database = new MongoConnector({
//     dbName: 'be5_database',
//     clientUrl: 'mongodb://localhost:27017',
// })

// const plugin = new Be5PageBuilder(BunRunner, {
//     adminRootPath: ""
// });


// await database.init([
//     plugin.getDatabase()
// ]);

// plugin.start();