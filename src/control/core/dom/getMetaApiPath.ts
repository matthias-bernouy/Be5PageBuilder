import { getMetaBasePath } from "./getMetaBasePath";

export function getMetaApiPath(){
    const base = getMetaBasePath();
    return base + "api";
}