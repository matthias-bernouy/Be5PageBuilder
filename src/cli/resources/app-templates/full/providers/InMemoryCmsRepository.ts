import type {
    CmsRepository,
    TBloc,
    TPage,
    TSnippet,
    TSystem,
    TTemplate,
} from "@bernouy/cms";

/**
 * Zero-dependency implementation of `CmsRepository` backed by in-process
 * `Map`s. Intended as a starter for development — state is lost on restart
 * and not shared across processes. Swap for a persistent provider (the
 * package ships a MongoDB one) before going to prod.
 */
export class InMemoryCmsRepository implements CmsRepository {

    private _blocs     = new Map<string, TBloc>();
    private _pages     = new Map<string, TPage>();
    private _templates = new Map<string, TTemplate>();
    private _snippets  = new Map<string, TSnippet>();
    private _system:     TSystem = makeDefaultSystem();

    // ── Blocs (keyed by manifest tag, stored as `id`) ────────────────────

    async createBloc(bloc: TBloc): Promise<TBloc> {
        if (this._blocs.has(bloc.id)) {
            throw new Error(`Bloc with id "${bloc.id}" already exists`);
        }
        this._blocs.set(bloc.id, bloc);
        return bloc;
    }

    async replaceBloc(bloc: TBloc): Promise<TBloc> {
        this._blocs.set(bloc.id, bloc);
        return bloc;
    }

    async getBlocsEditorJS(): Promise<{ id: string; editorJS: string }[]> {
        return [...this._blocs.values()].map((b) => ({ id: b.id, editorJS: b.editorJS }));
    }

    async getBlocsList(): Promise<{ id: string; name: string; group: string; description: string }[]> {
        return [...this._blocs.values()].map((b) => ({
            id: b.id,
            name: b.name,
            group: b.group,
            description: b.description,
        }));
    }

    async getBlocViewJS(htmlTag: string): Promise<string | null> {
        return this._blocs.get(htmlTag)?.viewJS ?? null;
    }

    // ── Pages (keyed by `path`) ──────────────────────────────────────────

    async createPage(page: TPage, oldPath?: string): Promise<TPage> {
        if (oldPath && oldPath !== page.path) this._pages.delete(oldPath);
        const stored: TPage = { ...page, id: page.id ?? crypto.randomUUID() };
        this._pages.set(stored.path, stored);
        return stored;
    }

    async getPage(path: string): Promise<TPage | null> {
        return this._pages.get(path) ?? null;
    }

    async getAllPages(): Promise<TPage[]> {
        return [...this._pages.values()];
    }

    // ── System (singleton) ───────────────────────────────────────────────

    async getSystem(): Promise<TSystem> {
        return structuredClone(this._system);
    }

    async updateSystem(update: Partial<TSystem>): Promise<TSystem> {
        this._system = {
            ...this._system,
            ...update,
            site:   { ...this._system.site,   ...(update.site   ?? {}) },
            editor: { ...this._system.editor, ...(update.editor ?? {}) },
        };
        return structuredClone(this._system);
    }

    // ── Templates (keyed by `id`) ────────────────────────────────────────

    async createTemplate(template: TTemplate): Promise<TTemplate> {
        const stored: TTemplate = { ...template, id: template.id ?? crypto.randomUUID() };
        this._templates.set(stored.id!, stored);
        return stored;
    }

    async getTemplateById(id: string): Promise<TTemplate | null> {
        return this._templates.get(id) ?? null;
    }

    async getAllTemplates(): Promise<TTemplate[]> {
        return [...this._templates.values()];
    }

    async updateTemplate(id: string, data: Partial<TTemplate>): Promise<TTemplate | null> {
        const current = this._templates.get(id);
        if (!current) return null;
        const next = { ...current, ...data, id };
        this._templates.set(id, next);
        return next;
    }

    async deleteTemplate(id: string): Promise<void> {
        this._templates.delete(id);
    }

    // ── Snippets (keyed by `id`, also indexed by `identifier`) ───────────

    async createSnippet(snippet: TSnippet): Promise<TSnippet> {
        const stored: TSnippet = { ...snippet, id: snippet.id ?? crypto.randomUUID() };
        this._snippets.set(stored.id!, stored);
        return stored;
    }

    async getSnippetById(id: string): Promise<TSnippet | null> {
        return this._snippets.get(id) ?? null;
    }

    async getSnippetByIdentifier(identifier: string): Promise<TSnippet | null> {
        for (const s of this._snippets.values()) {
            if (s.identifier === identifier) return s;
        }
        return null;
    }

    async getAllSnippets(): Promise<TSnippet[]> {
        return [...this._snippets.values()];
    }

    async updateSnippet(id: string, data: Partial<TSnippet>): Promise<TSnippet | null> {
        const current = this._snippets.get(id);
        if (!current) return null;
        const next = { ...current, ...data, id, updatedAt: new Date() };
        this._snippets.set(id, next);
        return next;
    }

    async deleteSnippet(id: string): Promise<void> {
        this._snippets.delete(id);
    }

    async findPagesUsingSnippet(identifier: string): Promise<TPage[]> {
        const needle = `identifier="${identifier}"`;
        return [...this._pages.values()].filter((p) => p.content.includes(needle));
    }
}

function makeDefaultSystem(): TSystem {
    return {
        initializationStep: 0,
        site: {
            name:        "My Site",
            favicon:     "",
            visible:     true,
            host:        "",
            language:    "en",
            theme:       "",
            notFound:    null,
            serverError: null,
        },
        editor: {
            layoutCategory: "",
        },
    };
}
