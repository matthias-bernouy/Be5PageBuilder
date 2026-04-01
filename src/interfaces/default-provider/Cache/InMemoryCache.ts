import type { Cache, CacheEntry } from "src/interfaces/contract/Cache/Cache";

export class InMemoryCache implements Cache {

    private store = new Map<string, CacheEntry>();
    private readonly isDev = process.env.MODE === "DEV";

    get(key: string): CacheEntry | null {
        if (this.isDev) return null;
        return this.store.get(key) || null;
    }

    set(key: string, value: CacheEntry): void {
        if (this.isDev) return;
        this.store.set(key, value);
    }

    delete(key: string): void {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }
}
