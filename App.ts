import { MongoConnector } from "be5-database-interface";
import { BunRunner } from "be5-system"
import { Be5PageBuilder } from "src/plugin/Be5PageBuilder";

console.log("Starting app...")

const plugin = new Be5PageBuilder(BunRunner, {
    adminRootPath: ""
});

const database = new MongoConnector({
    dbName: 'be5_database',
    clientUrl: 'mongodb://localhost:27017',
})

await database.init([
    plugin.getDatabase()
]);

plugin.start();