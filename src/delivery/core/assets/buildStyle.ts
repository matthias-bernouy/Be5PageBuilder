import type DeliveryCms from "src/delivery/DeliveryCms";
import type { CacheEntry } from "src/socle/contracts/Cache/Cache";
import { compress } from "src/control/server/compression";

/**
 * Build the theme stylesheet entry served at `<cmsPathPrefix>/style`. For
 * now it's simply the raw CSS configured in `site.theme`; any future
 * augmentation (runtime tokens, inlined critical CSS, etc.) belongs here
 * rather than in the endpoint handler.
 */
export async function generateStyleEntry(delivery: DeliveryCms): Promise<CacheEntry> {
    const settings = await delivery.repository.getSystem();
    return compress(settings.site?.theme || "", "text/css");
}
