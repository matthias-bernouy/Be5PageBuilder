// Single-worker queue with dedup + generation counter. Processing is
// serial because Playwright + sharp are both heavy enough that running
// multiple optimizations in parallel competes for memory more than it
// shortens latency.
//
// Generation counter guards against the "save twice fast" race: each
// enqueue for the same key bumps the generation; the worker captures the
// generation at job start and discards its result if a newer save arrived
// while it was running. The persist step (provided by the caller) is only
// invoked when the captured generation is still current.

export type OptimizeJob = {
    key: string;
    /** Bumped on every enqueue for this key — used to detect stale results. */
    generation: number;
    payload: unknown;
};

export type OptimizeRunner = (
    job: OptimizeJob,
    isCurrent: () => boolean,
) => Promise<void>;

export class OptimizationQueue {
    private _pending = new Map<string, { generation: number; payload: unknown }>();
    private _running = false;
    private _generations = new Map<string, number>();

    constructor(private _runner: OptimizeRunner) {}

    enqueue(key: string, payload: unknown): void {
        const nextGen = (this._generations.get(key) ?? 0) + 1;
        this._generations.set(key, nextGen);
        this._pending.set(key, { generation: nextGen, payload });
        // Fire-and-forget — the worker chains itself until the queue empties.
        if (!this._running) void this._drain();
    }

    /** Generation currently observed for a key. Visible for tests / introspection. */
    currentGeneration(key: string): number {
        return this._generations.get(key) ?? 0;
    }

    /** Number of pending (not-yet-running) jobs. Visible for tests. */
    get pendingSize(): number {
        return this._pending.size;
    }

    private async _drain(): Promise<void> {
        if (this._running) return;
        this._running = true;
        try {
            while (this._pending.size > 0) {
                // Pull the oldest pending entry — Map iteration is insertion
                // order, so re-enqueuing an existing key (.set on an existing
                // entry) preserves its position rather than promoting it.
                const next = this._pending.entries().next();
                if (next.done) break;
                const [key, { generation, payload }] = next.value;
                this._pending.delete(key);

                const job: OptimizeJob = { key, generation, payload };
                const isCurrent = () => this._generations.get(key) === generation;
                try {
                    await this._runner(job, isCurrent);
                } catch (err) {
                    // The runner is responsible for its own logging; this
                    // catch only protects the worker loop from a single
                    // failed job killing the queue.
                    console.error(`[image-optim] job ${key} failed:`, err);
                }
            }
        } finally {
            this._running = false;
        }
    }
}
