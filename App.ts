import { Be5_Authentication, Be5_MongoDB, Be5_Runner } from "be5-interfaces"

const MongoDatabaseCore = new Be5_MongoDB();
const BunRunnerCore = new Be5_Runner();
const AuthenticationCore = new Be5_Authentication(MongoDatabaseCore, BunRunnerCore);

await MongoDatabaseCore.init({
    dbName: 'be5_database',
    clientUrl: 'mongodb://localhost:27017',
})

BunRunnerCore.start();

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