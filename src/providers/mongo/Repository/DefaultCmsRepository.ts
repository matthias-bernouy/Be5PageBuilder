import { MongoClient, type Db } from "mongodb";
import type { CmsRepository } from "src/contracts/Repository/CmsRepository";
import type { TBloc, TPage, TSnippet, TSystem, TTemplate } from "src/contracts/Repository/TModels";
import { BlocsRepository } from "./collections/BlocsRepository";
import { PagesRepository } from "./collections/PagesRepository";
import { SystemRepository } from "./collections/SystemRepository";
import { TemplatesRepository } from "./collections/TemplatesRepository";
import { SnippetsRepository } from "./collections/SnippetsRepository";

type DefaultDatastoreConfig = {
    uri: string;
    databaseName: string;
}

/**
 * Default MongoDB-backed implementation of CmsRepository. Acts as a
 * composition root over one sub-repository per collection — all persistence
 * logic lives in `./collections/*`. This class just delegates and owns the
 * Mongo connection lifecycle.
 */
export class DefaultCmsRepository implements CmsRepository {

    private _database: Db;
    private _blocs:     BlocsRepository;
    private _pages:     PagesRepository;
    private _system:    SystemRepository;
    private _templates: TemplatesRepository;
    private _snippets:  SnippetsRepository;

    constructor(client: MongoClient, databaseName: string) {
        this._database  = client.db(databaseName);
        this._blocs     = new BlocsRepository(this._database);
        this._pages     = new PagesRepository(this._database);
        this._system    = new SystemRepository(this._database);
        this._templates = new TemplatesRepository(this._database);
        this._snippets  = new SnippetsRepository(this._database);
    }

    static create(config: DefaultDatastoreConfig): Promise<DefaultCmsRepository> {
        return new Promise((resolve, reject) => {
            new MongoClient(config.uri).connect().then(client => {
                resolve(new DefaultCmsRepository(client, config.databaseName));
            }).catch(err => {
                console.error("Failed to connect to the database", err);
                reject(err);
            });
        });
    }

    async reset(): Promise<void> {
        try {
            await Promise.all([
                this._blocs.clear(),
                this._pages.clear(),
                this._system.clear(),
            ]);
        } catch (err) {
            console.error("Failed to reset the database", err);
            throw err;
        }
    }

    // ── Blocs ──

    createBloc(bloc: TBloc): Promise<TBloc> {
        return this._blocs.create(bloc);
    }

    replaceBloc(bloc: TBloc): Promise<TBloc> {
        return this._blocs.replace(bloc);
    }

    getBlocsEditorJS(): Promise<{ id: string, editorJS: string }[]> {
        return this._blocs.getEditorJS();
    }

    getBlocsList(): Promise<{ id: string, name: string, group: string, description: string }[]> {
        return this._blocs.getList();
    }

    getBlocViewJS(id: string): Promise<string | null> {
        return this._blocs.getViewJS(id);
    }

    // ── Pages ──

    createPage(page: TPage, oldKey?: { path: string; identifier: string }): Promise<TPage> {
        return this._pages.upsert(page, oldKey);
    }

    getPage(path: string, identifier: string): Promise<TPage | null> {
        return this._pages.getByKey(path, identifier);
    }

    getAllPages(): Promise<TPage[]> {
        return this._pages.getAll();
    }

    // ── System ──

    getSystem(): Promise<TSystem> {
        return this._system.get();
    }

    updateSystem(update: Partial<TSystem>): Promise<TSystem> {
        return this._system.update(update);
    }

    // ── Templates ──

    createTemplate(template: TTemplate): Promise<TTemplate> {
        return this._templates.create(template);
    }

    getTemplateById(id: string): Promise<TTemplate | null> {
        return this._templates.getById(id);
    }

    getAllTemplates(): Promise<TTemplate[]> {
        return this._templates.getAll();
    }

    updateTemplate(id: string, data: Partial<TTemplate>): Promise<TTemplate | null> {
        return this._templates.update(id, data);
    }

    deleteTemplate(id: string): Promise<void> {
        return this._templates.delete(id);
    }

    // ── Snippets ──

    createSnippet(snippet: TSnippet): Promise<TSnippet> {
        return this._snippets.create(snippet);
    }

    getSnippetById(id: string): Promise<TSnippet | null> {
        return this._snippets.getById(id);
    }

    getSnippetByIdentifier(identifier: string): Promise<TSnippet | null> {
        return this._snippets.getByIdentifier(identifier);
    }

    getAllSnippets(): Promise<TSnippet[]> {
        return this._snippets.getAll();
    }

    updateSnippet(id: string, data: Partial<TSnippet>): Promise<TSnippet | null> {
        return this._snippets.update(id, data);
    }

    deleteSnippet(id: string): Promise<void> {
        return this._snippets.delete(id);
    }

    findPagesUsingSnippet(identifier: string): Promise<TPage[]> {
        return this._pages.findUsingSnippet(identifier);
    }

}
