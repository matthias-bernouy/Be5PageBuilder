import type { Cache, CacheEntry } from "src/interfaces/contract/Cache/Cache";

export class InMemoryCache implements Cache {

    private store = new Map<string, CacheEntry>();

    get(key: string): CacheEntry | null {
        return this.store.get(key) || null;
    }

    set(key: string, value: CacheEntry): void {
        this.store.set(key, value);
    }

    delete(key: string): void {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }
}
