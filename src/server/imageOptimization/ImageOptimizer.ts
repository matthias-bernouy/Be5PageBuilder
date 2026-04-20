import type { Cms } from "src/Cms";
import { P9R_CACHE } from "src/constants/p9r-constants";
import { OptimizationQueue, type OptimizeJob } from "./OptimizationQueue";
import { PlaywrightSession } from "./PlaywrightSession";
import { optimizePage, type OptimizePagePayload } from "./optimizePage";

/**
 * Façade owned by `Cms`. Handles the bookkeeping (queue, session
 * lifecycle, cache key) so callers only need to know about
 * `enqueuePageOptimization(path, identifier, origin)`.
 *
 * Disabled-by-default would make the feature invisible to consumers; it's
 * always on, but a Playwright launch failure inside `PlaywrightSession`
 * silently disables future runs without raising — see PlaywrightSession.
 */
export class ImageOptimizer {
    private _session = new PlaywrightSession();
    private _queue: OptimizationQueue;

    constructor(private _system: Cms) {
        this._queue = new OptimizationQueue((job, isCurrent) => this._run(job, isCurrent));
    }

    enqueuePageOptimization(path: string, identifier: string, origin: string): void {
        const payload: OptimizePagePayload = {
            path,
            identifier,
            origin,
            cacheKey: P9R_CACHE.page(path, identifier),
        };
        this._queue.enqueue(payload.cacheKey, payload);
    }

    async close(): Promise<void> {
        await this._session.close();
    }

    private async _run(job: OptimizeJob, isCurrent: () => boolean): Promise<void> {
        const payload = job.payload as OptimizePagePayload;
        await optimizePage(payload, this._session, this._system, isCurrent);
    }
}
