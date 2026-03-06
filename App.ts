import { Be5System, BunRunner } from "be5-system"
import { Be5PageBuilder } from "src/Be5PageBuilder";
import { registerEndpoints } from "src/endpoints/registerEndpoints";

console.log("Starting app...")

const system = new Be5PageBuilder(BunRunner);

system.start();