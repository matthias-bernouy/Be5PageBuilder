export type CacheEntry = {
    raw: Uint8Array;
    brotli: Uint8Array;
    gzip: Uint8Array;
    contentType: string;
}

export interface Cache {
    get(key: string): CacheEntry | null;
    set(key: string, value: CacheEntry): void;
    delete(key: string): void;
    clear(): void;
}
