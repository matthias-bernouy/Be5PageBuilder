import type { KVStore } from "src/contracts/KVStore/KVStore";

type Entry = { value: string; expiresAt: number | null };

export class InMemoryKVStore implements KVStore {
    private store = new Map<string, Entry>();

    async get(key: string): Promise<string | null> {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        const expiresAt = ttlSeconds != null ? Date.now() + ttlSeconds * 1000 : null;
        this.store.set(key, { value, expiresAt });
    }

    async delete(key: string): Promise<void> {
        this.store.delete(key);
    }

    async clear(): Promise<void> {
        this.store.clear();
    }

    async entries(pattern?: string): Promise<Map<string, string>> {
        const result = new Map<string, string>();
        const now = Date.now();
        const match = pattern ? globToRegex(pattern) : null;
        for (const [key, entry] of this.store) {
            if (entry.expiresAt !== null && now > entry.expiresAt) continue;
            if (match && !match.test(key)) continue;
            result.set(key, entry.value);
        }
        return result;
    }

    async keys(pattern?: string): Promise<string[]> {
        return [...(await this.entries(pattern)).keys()];
    }
}

function globToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`);
}
