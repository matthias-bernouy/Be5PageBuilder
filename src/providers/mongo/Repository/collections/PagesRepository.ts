import type { Collection, Db } from "mongodb";
import type { TPage } from "src/contracts/Repository/TModels";

/**
 * MongoDB-backed persistence for pages. Pages are uniquely identified by
 * the compound key (path, identifier); the unique index is ensured in the
 * constructor, along with a one-shot migration dropping the legacy
 * `identifier_1` index from pre-compound-key databases.
 */
export class PagesRepository {

    private _collection: Collection<TPage>;

    constructor(database: Db) {
        this._collection = database.collection<TPage>("pages");

        // Migration: drop legacy unique index on identifier alone, then create
        // the compound unique index on (path, identifier). The legacy index may
        // not exist (fresh DB) — ignore NamespaceNotFound errors.
        this._collection.dropIndex("identifier_1").catch(() => { /* ignore */ });
        this._collection.createIndex({ path: 1, identifier: 1 }, { unique: true }).catch(err => {
            console.error("Failed to create unique index on pages.(path, identifier)", err);
        });
    }

    clear(): Promise<unknown> {
        return this._collection.deleteMany({});
    }

    async upsert(page: TPage, oldKey?: { path: string; identifier: string }): Promise<TPage> {
        const filter = oldKey
            ? { path: oldKey.path, identifier: oldKey.identifier }
            : { path: page.path, identifier: page.identifier };

        const result = await this._collection.replaceOne(filter, page, { upsert: true });
        if (!result.acknowledged) {
            throw new Error("Upsert not acknowledged by MongoDB");
        }
        return page;
    }

    async getByKey(path: string, identifier: string): Promise<TPage | null> {
        const page = await this._collection.findOne({ path, identifier });
        return page as TPage | null;
    }

    async getAll(): Promise<TPage[]> {
        return await this._collection.find({}).toArray() as TPage[];
    }

    /**
     * Finds every page whose content contains a `<w13c-snippet>` element
     * referencing the given snippet identifier. Used to invalidate cached
     * page renders when a snippet is edited or deleted.
     */
    async findUsingSnippet(identifier: string): Promise<TPage[]> {
        const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`<w13c-snippet[^>]*\\bidentifier\\s*=\\s*["']${escaped}["']`, "i");
        const docs = await this._collection.find({ content: { $regex: regex } }).toArray();
        return docs as TPage[];
    }
}
