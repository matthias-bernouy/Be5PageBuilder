// Bounded LRU for image variants generated on-demand by sharp. Two limits
// are enforced together — entry count keeps the Map walk cheap, byte budget
// keeps memory pressure predictable.
//
// Keys are `${id}:${w}:${h}` (with empty segments for missing dimensions),
// so an item-level invalidation can prefix-scan `${id}:` and drop every
// variant of that source in one pass — required when updateMetadata or
// deleteItem changes the underlying bytes.

type Entry = { bytes: Uint8Array; size: number };

export class VariantCache {
    private _map = new Map<string, Entry>();
    private _bytesUsed = 0;

    constructor(
        private _maxEntries: number,
        private _maxBytes: number,
    ) {}

    static keyFor(id: string, w?: number, h?: number): string {
        return `${id}:${w ?? ""}:${h ?? ""}`;
    }

    static prefixFor(id: string): string {
        return `${id}:`;
    }

    get(key: string): Uint8Array | undefined {
        const entry = this._map.get(key);
        if (!entry) return undefined;
        // LRU bump: re-insert moves the key to the end of Map iteration order.
        this._map.delete(key);
        this._map.set(key, entry);
        return entry.bytes;
    }

    set(key: string, bytes: Uint8Array): void {
        const existing = this._map.get(key);
        if (existing) {
            this._bytesUsed -= existing.size;
            this._map.delete(key);
        }
        // A single variant larger than the whole budget would otherwise
        // empty the cache trying to fit itself. Skip caching it.
        if (bytes.byteLength > this._maxBytes) return;
        const entry: Entry = { bytes, size: bytes.byteLength };
        this._map.set(key, entry);
        this._bytesUsed += entry.size;
        this._evict();
    }

    invalidatePrefix(prefix: string): void {
        for (const key of [...this._map.keys()]) {
            if (key.startsWith(prefix)) {
                const entry = this._map.get(key)!;
                this._bytesUsed -= entry.size;
                this._map.delete(key);
            }
        }
    }

    clear(): void {
        this._map.clear();
        this._bytesUsed = 0;
    }

    private _evict(): void {
        while (this._map.size > this._maxEntries || this._bytesUsed > this._maxBytes) {
            const oldest = this._map.keys().next().value;
            if (oldest === undefined) break;
            const entry = this._map.get(oldest)!;
            this._bytesUsed -= entry.size;
            this._map.delete(oldest);
        }
    }

    get size(): number { return this._map.size; }
    get bytesUsed(): number { return this._bytesUsed; }
}
