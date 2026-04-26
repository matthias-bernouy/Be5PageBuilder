import { getMetaApiPath } from 'src/control/core/dom/meta/getMetaApiPath';
import type { BlocMeta, SnippetItem, TemplateItem } from './types';
import resolveApiUrl from 'src/control/core/dom/meta/resolveApiUrl';
import type { BlocListItemResponse } from 'src/socle/contracts/Repository/CmsRepository';

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
    try {
        const res = await fetch(resolveApiUrl(path));
        if (!res.ok) return fallback;
        return await res.json() as T;
    } catch(e) {
        console.log(e);
        return fallback;
    }
}

export const fetchTemplates = () => fetchJson<TemplateItem[]>('template/list', []);
export const fetchSnippets = () => fetchJson<SnippetItem[]>('snippet/list', []);

export async function fetchBlocMeta(): Promise<Map<string, BlocMeta>> {
    const list = await fetchJson<BlocListItemResponse[]>('bloc/list', []);
    return new Map(list.map(b => [b.id, { description: b.description }]));
}
