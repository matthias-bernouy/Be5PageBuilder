import { getMetaApiPath } from 'src/control/core/dom/getMetaApiPath';
import type { BlocMeta, SnippetItem, TemplateItem } from './types';

type BlocListEntry = { id: string; name: string; group: string; description: string };

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
    try {
        const res = await fetch(new URL(path, getMetaApiPath()));
        if (!res.ok) return fallback;
        return await res.json() as T;
    } catch {
        return fallback;
    }
}

export const fetchTemplates = () => fetchJson<TemplateItem[]>('template/list', []);
export const fetchSnippets = () => fetchJson<SnippetItem[]>('snippet/list', []);

export async function fetchBlocMeta(): Promise<Map<string, BlocMeta>> {
    const list = await fetchJson<BlocListEntry[]>('bloc/list', []);
    return new Map(list.map(b => [b.id, { description: b.description }]));
}
