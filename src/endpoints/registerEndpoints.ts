import { type Be5System } from "be5-system";
import { registerUIFolder, registerCSSFolder, registerJSFolder, registerAPIFolder } from "src/Be5System/utilities";
import { join, resolve } from "node:path"

const root = process.cwd();
function res(str: string){
    console.log(join(root, "src/endpoints", str))
    return join(root, "src/endpoints", str);
}

export function registerEndpoints(system: Be5System){

    system.registerEndpoint("/health", "GET", () => new Response("") )
    
    registerUIFolder("/admin", res("admin"), system);
    registerUIFolder("/", res("client"), system);

    registerCSSFolder("/assets", res("css"), system);
    registerJSFolder("/assets", res("js"), system);
    registerAPIFolder("/api", res("api"), system);
    
}

