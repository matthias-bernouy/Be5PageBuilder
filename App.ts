import { Be5_Authentication, Be5_MongoDB, Be5_Runner } from "be5-interfaces"
import { PageBuilder } from "src/PageBuilder";
import { BlocModel } from "src/data/model/BlocModel";

const MongoDatabaseCore = new Be5_MongoDB();
const BunRunnerCore = new Be5_Runner();
const AuthenticationCore = new Be5_Authentication(MongoDatabaseCore, BunRunnerCore, {
    defaultRedirection: "/page-builder/admin/pages",
    basePath: "/auth"
});

AuthenticationCore.registerDisabled = true;

new PageBuilder(BunRunnerCore, MongoDatabaseCore, AuthenticationCore, {
    "adminPathPrefix": "",
    "clientPathPrefix": ""
})

await MongoDatabaseCore.init({
    dbName: 'testttt',
    clientUrl: 'mongodb://localhost:27017',
})

BunRunnerCore.start();

await MongoDatabaseCore.getRepository(BlocModel).nativeDelete({});

const result = Bun.spawnSync(["bun", "run", "src/cli/CLI_importBloc.ts", "w13c/Base", "HeroSection", "base"], {
  stdout: "inherit",
  stderr: "inherit",
});

if (!result.success) {
  console.error("The import failed!");
}

console.log("Starting app...")