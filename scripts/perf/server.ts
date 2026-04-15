import { AuthRepositoryProvider, Be5_Authentication, Be5_Runner } from "@bernouy/socle";
import { MongoClient } from "mongodb";
import { PageBuilder } from "../../src/PageBuilder";
import { DefaultPageBuilderRepository } from "../../src/interfaces/default-provider/Repository/DefaultPagebuilderRepository";
import { DefaultMediaRepository } from "../../src/interfaces/default-provider/Media/DefaultMediaRepository";

export type PerfServer = {
    port: number;
    baseUrl: string;
    stop: () => Promise<void>;
};

export async function startPerfServer(opts: { port?: number; dbName?: string; mongoUri?: string } = {}): Promise<PerfServer> {
    const port = opts.port ?? 4999;
    const dbName = opts.dbName ?? "p9r_perf_test";
    const mongoUri = opts.mongoUri ?? "mongodb://localhost:27017";

    const mongoClient = await new MongoClient(mongoUri).connect();
    await mongoClient.db(dbName).dropDatabase();

    const runner = new Be5_Runner();
    const repository = new DefaultPageBuilderRepository(mongoClient, dbName);
    const authRepository = new AuthRepositoryProvider(mongoClient, dbName);
    const mediaRepository = new DefaultMediaRepository("default", mongoClient, dbName, runner);

    const auth = new Be5_Authentication(authRepository, runner, {
        basePath: "/auth",
        defaultRedirection: "/page-builder/admin/pages",
        registerDisabled: false,
    });

    new PageBuilder(runner, repository, auth, mediaRepository, {
        adminPathPrefix: "/page-builder",
        clientPathPrefix: "/",
    });

    runner.start(port);

    return {
        port,
        baseUrl: `http://localhost:${port}`,
        stop: async () => {
            await mongoClient.close(true);
            const stop = (runner as unknown as { stop?: () => void }).stop;
            if (typeof stop === "function") stop.call(runner);
        },
    };
}
