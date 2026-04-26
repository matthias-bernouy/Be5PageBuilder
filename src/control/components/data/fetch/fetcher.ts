export type FetchOutcome =
    | { kind: 'success'; data: unknown }
    | { kind: 'error'; error: unknown }
    | { kind: 'aborted' };

/**
 * Resolves `url` relative to the current location, forwards every query
 * param of `window.location.search` to the request, and returns a
 * discriminated outcome — never throws. Aborted requests surface as
 * `{ kind: 'aborted' }` so the caller can drop them.
 */
export async function runFetch(url: string, signal: AbortSignal): Promise<FetchOutcome> {
    try {
        const u = new URL(url, window.location.href);
        for (const [k, v] of new URLSearchParams(window.location.search)) u.searchParams.append(k, v);
        const res = await fetch(u, { headers: { Accept: 'application/json' }, signal });
        if (!res.ok) return { kind: 'error', error: new Error(`HTTP ${res.status}`) };
        const data = await res.json() as unknown;
        return { kind: 'success', data };
    } catch (error) {
        if ((error as DOMException).name === 'AbortError') return { kind: 'aborted' };
        return { kind: 'error', error };
    }
}
