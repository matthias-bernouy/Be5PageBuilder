import type { Runner } from "@bernouy/socle";
import replaceBasePath from "./replaceBasePath";

import template from "./template.html" with { type: "text" }

export default async function prepareHtml(path: string, runner: Runner){

    let temp = template as unknown as string;

    temp = replaceBasePath(temp, runner.basePath);

    temp = temp.replace("{{CONTENT}}", await Bun.file(path).text())

    return temp;

}