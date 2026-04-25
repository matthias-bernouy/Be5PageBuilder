import type { ControlCms } from "src/control/ControlCms";
import { isValidPathFormat } from "src/socle/utils/validation";
import MissingParam from "src/control/errors/Http/MissingParam";
import InvalidParam from "src/control/errors/Http/InvalidParam";
import { assertValidPageTitle } from "src/control/core/validation/pageTitle";

export default async function postPage(req: Request, cms: ControlCms) {
    const { title, path } = await req.json();

    if ( !title ) throw new MissingParam("title");
    if ( !path )  throw new MissingParam("path");

    if ( !isValidPathFormat(path) ) throw new InvalidParam("path",  "Must start with '/' and contain no '?', '#' or ':'.");

    assertValidPageTitle(title);

    await cms.repository.insertPage(path, title);

    return new Response();
}
