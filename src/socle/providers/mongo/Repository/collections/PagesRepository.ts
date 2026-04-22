import type { Collection, Db } from "mongodb";
import type { TPage } from "src/socle/contracts/Repository/TModels";

/**
 * MongoDB-backed persistence for pages. Pages are uniquely identified by
 * their `path`; the unique index is ensured in the constructor, along with
 * a one-shot migration dropping legacy compound indexes from pre-single-key
 * databases.
 */
export class PagesRepository {

    private _collection: Collection<TPage>;

    constructor(database: Db) {
        this._collection = database.collection<TPage>("pages");

        // Migration: drop legacy indexes, then create the unique index on
        // path alone. Ignore NamespaceNotFound errors when the legacy index
        // doesn't exist (fresh DB).
        this._collection.dropIndex("identifier_1").catch(() => { /* ignore */ });
        this._collection.dropIndex("path_1_identifier_1").catch(() => { /* ignore */ });
        this._collection.createIndex({ path: 1 }, { unique: true }).catch(err => {
            console.error("Failed to create unique index on pages.path", err);
        });
    }

    clear(): Promise<unknown> {
        return this._collection.deleteMany({});
    }

    async upsert(page: TPage, oldPath?: string): Promise<TPage> {
        const filter = { path: oldPath ?? page.path };
        const result = await this._collection.replaceOne(filter, page, { upsert: true });
        if (!result.acknowledged) {
            throw new Error("Upsert not acknowledged by MongoDB");
        }
        return page;
    }

    async getByPath(path: string): Promise<TPage | null> {
        const page = await this._collection.findOne({ path });
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
