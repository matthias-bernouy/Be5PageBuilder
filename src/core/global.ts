import { P9R_ATTR } from "types/editor-attributs";
import { P9R_CACHE, P9R_EVENT, P9R_ID, P9R_MODE } from "types/p9r-constants";

(window as any).p9r = {
    attr:  P9R_ATTR,
    mode:  P9R_MODE,
    event: P9R_EVENT,
    id:    P9R_ID,
    cache: P9R_CACHE,
}
