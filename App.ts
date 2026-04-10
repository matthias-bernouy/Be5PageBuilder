import { Authentication, AuthRepositoryProvider, Be5_Runner } from "@bernouy/socle";
import { MongoClient } from "mongodb";
import { PageBuilder } from "src/PageBuilder";
import { DefaultPageBuilderRepository } from "src/interfaces/default-provider/Repository/DefaultPagebuilderRepository";
import { DefaultMediaRepository } from "src/interfaces/default-provider/Media/DefaultMediaRepository";
import { signDevToken } from "src/server/devToken";
import importBlocs from "src/cli/CLI_importBloc";

const dbName = process.env.P9R_DB_NAME || "p9r_dev";
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const port = Number(process.env.PORT) || 4999;
const devTokenSecret = process.env.P9R_DEV_TOKEN_SECRET || "dev-secret-change-me";

const mongoClient = await new MongoClient(mongoUri).connect();

const runner = new Be5_Runner();
const repository = new DefaultPageBuilderRepository(mongoClient, dbName);
const authRepository = new AuthRepositoryProvider(mongoClient, dbName);
const mediaRepository = new DefaultMediaRepository("default", mongoClient, dbName, runner);

const auth = new Authentication(authRepository, runner, {
    basePath: "/auth",
    defaultRedirection: "/page-builder/admin/pages",
});
auth.registerDisabled = true;

new PageBuilder(runner, repository, auth, mediaRepository, {
    adminPathPrefix: "/page-builder",
    clientPathPrefix: "/",
    devTokenSecret,
});

runner.start(port);
console.log(`App running on http://localhost:${port}`);
console.log(`Admin: http://localhost:${port}/page-builder/admin/pages`);
console.log(`Dev token page: http://localhost:${port}/page-builder/admin/dev-token`);

// Reseed through the same HTTP path the standalone CLI uses — mint a local
// dev token, point at our own port, and let the auth guard's bearer bypass
// waive the admin check. Runs after `runner.start` so the POSTs have a
// server to hit.
if (process.env.RESEED === "1") {
    await repository.reset();
    const token = signDevToken(devTokenSecret);
    const cms = `http://localhost:${port}`;
    await importBlocs(["./w13c/blocs/Layout",       "layout",       `--cms=${cms}`, `--token=${token}`]);
    await importBlocs(["./w13c/blocs/Form",         "form",         `--cms=${cms}`, `--token=${token}`]);
    await importBlocs(["./w13c/blocs/Presentation", "presentation", `--cms=${cms}`, `--token=${token}`]);
    console.log("[App] Reseed complete");
}
