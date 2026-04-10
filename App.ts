import { AuthRepositoryProvider, Be5_Authentication, Be5_Runner } from "@bernouy/socle";
import { MongoClient } from "mongodb";
import { PageBuilder } from "src/PageBuilder";
import { DefaultPageBuilderRepository } from "src/interfaces/default-provider/Repository/DefaultPagebuilderRepository";
import { DefaultMediaRepository } from "src/interfaces/default-provider/Media/DefaultMediaRepository";

const dbName = process.env.P9R_DB_NAME || "p9r_dev";
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const port = Number(process.env.PORT) || 4999;

const mongoClient = await new MongoClient(mongoUri).connect();

const runner = new Be5_Runner();
const repository = new DefaultPageBuilderRepository(mongoClient, dbName);
const authRepository = new AuthRepositoryProvider(mongoClient, dbName);
const mediaRepository = new DefaultMediaRepository("default", mongoClient, dbName, runner);

const auth = new Be5_Authentication(authRepository, runner, {
    basePath: "/auth",
    defaultRedirection: "/page-builder/admin/pages",
    registerDisabled: true,
});

new PageBuilder(runner, repository, auth, mediaRepository, {
    adminPathPrefix: "/page-builder",
    clientPathPrefix: "/"
});

runner.start(port);
console.log(`App running on http://localhost:${port}`);
console.log(`Admin: http://localhost:${port}/page-builder/admin/pages`);