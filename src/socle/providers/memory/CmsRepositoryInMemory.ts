import { randomUUIDv7 } from "bun";
import type { CmsRepository } from "src/socle/contracts/Repository/CmsRepository";
import type { TBloc, TPage, TSnippet, TSystem, TTemplate } from "src/socle/contracts/Repository/TModels";

/**
 * In-memory implementation of CmsRepository for local development and testing.
 * No persistence — all data is lost when the process exits.
 * Drop-in replacement for DefaultCmsRepository: same contract, zero infra.
 */
export class InMemoryCmsRepository implements CmsRepository {



    // ── Storage ──

    private _blocs:         Map<string, TBloc>     = new Map();
    private _pages:         Map<string, TPage>     = new Map(); // keyed by path
    private _pagesById:     Map<string, TPage>     = new Map(); // keyed by path
    private _snippets:  Map<string, TSnippet>  = new Map(); // keyed by ObjectId-like uid
    private _templates: Map<string, TTemplate> = new Map(); // keyed by ObjectId-like uid

    private _system: TSystem = {
        initializationStep: 0,
        site: {
            name:        "",
            favicon:     "",
            visible:     true,
            host:        "",
            language:    "",
            theme:       "",
            notFound:    null,
            serverError: null,
        },
        editor: { layoutCategory: "" },
    };

    private _nextId(): string {
        // Simple monotonic counter encoded as a hex string so it looks vaguely
        // like an ObjectId without pulling in the full bson package.
        return (++InMemoryCmsRepository._counter).toString(16).padStart(24, "0");
    }
    private static _counter = 0;

    // ── Reset ──

    async reset(): Promise<void> {
        this._blocs.clear();
        this._pages.clear();
        this._system = {
            initializationStep: 0,
            site: {
                name: "", favicon: "", visible: true, host: "",
                language: "", theme: "", notFound: null, serverError: null,
            },
            editor: { layoutCategory: "" },
        };
        // Snippets and templates are intentionally NOT cleared (mirrors DefaultCmsRepository.reset).
    }

    // ── Blocs ──

    async createBloc(bloc: TBloc): Promise<TBloc> {
        if (this._blocs.has(bloc.id)) {
            throw new Error(`Bloc with id "${bloc.id}" already exists`);
        }
        this._blocs.set(bloc.id, { ...bloc });
        return bloc;
    }

    async getLinks(){
        return Array.from(this._pages.values()).map(v => ({ path: v.path, title: v.title }));
    }

    async getTemplateCategories(): Promise<string[]> {
        const set = new Set<string>();
        for (const t of this._templates.values()) {
            if (t.category) set.add(t.category);
        }
        return Array.from(set).sort();
    }

    async insertPage(path: string, title: string): Promise<void> {
        const page = {
            id: randomUUIDv7(),
            path: path,
            title: title,
            content: "<p></p>",
            description: "",
            tags: [],
            visible: false
        }
        this._pagesById.set(page.id, page);
        this._pages.set(page.path, page);
    }

    async getPagesMetadata(): Promise<{ id: string; path: string; title: string; tags: string[]; visible: boolean; }[]> {
        return Array.from(this._pages.values()).map((val) => ({
            id: val.id,
            path: val.path,
            title: val.title,
            tags: val.tags,
            visible: val.visible,
        }));
    }

    async getTemplatesMetadata(): Promise<{ id: string; name: string; category: string; createdAt: string; }[]> {
        return this._templates.values().map((val) => {
            return {
                id: val.id,
                name: val.name,
                category: val.category,
                createdAt: val.createdAt.toDateString()
            }
        }).toArray()
    }

    async updatePage(page: TPage){
        this._pages.set(page.path, page);
        this._pagesById.set(page.id, page);
    }



    async getPageById(id: string): Promise<TPage | null> {
        return this._pagesById.get(id) ?? null;
    }

    async replaceBloc(bloc: TBloc): Promise<TBloc> {
        this._blocs.set(bloc.id, { ...bloc });
        return bloc;
    }

    async getBlocsJS(): Promise<{ id: string; editorJS: string; viewJS: string }[]> {
        return Array.from(this._blocs.values()).map(b => ({ id: b.id, editorJS: b.editorJS, viewJS: b.viewJS }));
    }

    async getBlocsList(): Promise<{ id: string; name: string; group: string; description: string }[]> {
        return Array.from(this._blocs.values()).map(b => ({
            id:          b.id,
            name:        b.name,
            group:       b.group       || "",
            description: b.description || "",
        }));
    }

    async getBlocViewJS(id: string): Promise<string | null> {
        return this._blocs.get(id)?.viewJS ?? null;
    }

    // ── Pages ──

    async getPage(path: string): Promise<TPage | null> {
        return this._pages.get(path) ?? null;
    }

    async getAllPages(): Promise<TPage[]> {
        return Array.from(this._pages.values()).map(p => ({ ...p }));
    }

    // ── System ──

    async getSystem(): Promise<TSystem> {
        return structuredClone(this._system);
    }

    async updateSystem(update: Partial<TSystem>): Promise<TSystem> {
        for (const [section, value] of Object.entries(update) as [keyof TSystem, any][]) {
            if (section === "initializationStep") {
                (this._system as any).initializationStep = value;
            } else if (typeof value === "object" && value !== null) {
                (this._system as any)[section] = {
                    ...(this._system as any)[section],
                    ...value,
                };
            }
        }
        return this.getSystem();
    }

    // ── Templates ──

    async createTemplate(template: Omit<TTemplate, 'id'>): Promise<TTemplate> {
        const id = this._nextId();
        const stored = { ...template, id };
        this._templates.set(id, stored);
        return stored;
    }

    async getTemplateById(id: string): Promise<TTemplate | null> {
        return this._templates.get(id) ? { ...this._templates.get(id)! } : null;
    }

    async getAllTemplates(): Promise<TTemplate[]> {
        return Array.from(this._templates.values()).map(t => ({ ...t }));
    }

    async updateTemplate(id: string, data: Partial<TTemplate>): Promise<TTemplate | null> {
        const existing = this._templates.get(id);
        if (!existing) return null;
        const { id: _, ...updateData } = data;
        const updated = { ...existing, ...updateData };
        this._templates.set(id, updated);
        return { ...updated };
    }

    async deleteTemplate(id: string): Promise<void> {
        this._templates.delete(id);
    }

    // ── Snippets ──

    async createSnippet(snippet: Omit<TSnippet, 'id'>): Promise<TSnippet> {
        // Enforce unique identifier (mirrors the MongoDB unique index).
        for (const s of this._snippets.values()) {
            if (s.identifier === snippet.identifier) {
                throw new Error(`Snippet with identifier "${snippet.identifier}" already exists`);
            }
        }
        const id = this._nextId();
        const stored = { ...snippet, id };
        this._snippets.set(id, stored);
        return stored;
    }

    async getSnippetById(id: string): Promise<TSnippet | null> {
        return this._snippets.get(id) ? { ...this._snippets.get(id)! } : null;
    }

    async getSnippetByIdentifier(identifier: string): Promise<TSnippet | null> {
        for (const s of this._snippets.values()) {
            if (s.identifier === identifier) return { ...s };
        }
        return null;
    }

    async getAllSnippets(): Promise<TSnippet[]> {
        return Array.from(this._snippets.values()).map(s => ({ ...s }));
    }

    async getSnippetsMetadata(): Promise<{ id: string; identifier: string; name: string; category: string; updatedAt: string; }[]> {
        return this._snippets.values().map((val) => {
            return {
                id: val.id,
                identifier: val.identifier,
                name: val.name,
                category: val.category,
                updatedAt: val.updatedAt.toDateString()
            }
        }).toArray()
    }

    async updateSnippet(id: string, data: Partial<TSnippet>): Promise<TSnippet | null> {
        const existing = this._snippets.get(id);
        if (!existing) return null;
        const { id: _, identifier: __, createdAt: ___, ...updateData } = data;
        const updated = { ...existing, ...updateData, updatedAt: new Date() };
        this._snippets.set(id, updated);
        return { ...updated };
    }

    async deleteSnippet(id: string): Promise<void> {
        this._snippets.delete(id);
    }

    async findPagesUsingSnippet(identifier: string): Promise<TPage[]> {
        const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`<w13c-snippet[^>]*\\bidentifier\\s*=\\s*["']${escaped}["']`, "i");
        return Array.from(this._pages.values()).filter(p => regex.test(p.content ?? ""));
    }
}