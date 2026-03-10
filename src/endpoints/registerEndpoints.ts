import { registerUIFolder, registerCSSFolder, registerJSFolder, registerAPIFolder } from "src/Be5System/utilities";
import { join, resolve } from "node:path"
import type { Be5PageBuilder } from "src/Be5PageBuilder";

const root = process.cwd();
function res(str: string){
    console.log(join(root, "src/endpoints", str))
    return join(root, "src/endpoints", str);
}

export function registerEndpoints(system: Be5PageBuilder){

    system.registerEndpoint("/health", "GET", () => new Response("") )
    
    registerUIFolder("/admin", res("admin"), system);
    registerUIFolder("/", res("client"), system);

    registerCSSFolder("/assets", res("css"), system);
    registerJSFolder("/assets", res("js"), system);
    registerAPIFolder("/api", res("api"), system);
    
}

