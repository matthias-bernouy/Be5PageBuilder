import { ObjectId, type Collection, type Db } from "mongodb";
import type { TSnippet } from "src/contracts/Repository/TModels";

/**
 * MongoDB-backed persistence for snippets. Identifiers are unique
 * (enforced via index); updates intentionally skip `identifier` and
 * `createdAt` so callers can't rewrite the key or the creation time.
 */
export class SnippetsRepository {

    private _collection: Collection<TSnippet>;

    constructor(database: Db) {
        this._collection = database.collection<TSnippet>("snippets");
        this._collection.createIndex({ identifier: 1 }, { unique: true }).catch(err => {
            console.error("Failed to create unique index on snippets.identifier", err);
        });
    }

    async create(snippet: TSnippet): Promise<TSnippet> {
        const result = await this._collection.insertOne(snippet as any);
        return { ...snippet, id: result.insertedId.toString() };
    }

    async getById(id: string): Promise<TSnippet | null> {
        const doc = await this._collection.findOne({ _id: new ObjectId(id) });
        if (!doc) return null;
        return { ...doc, id: (doc as any)._id.toString() } as TSnippet;
    }

    async getByIdentifier(identifier: string): Promise<TSnippet | null> {
        const doc = await this._collection.findOne({ identifier });
        if (!doc) return null;
        return { ...doc, id: (doc as any)._id.toString() } as TSnippet;
    }

    async getAll(): Promise<TSnippet[]> {
        const docs = await this._collection.find({}).toArray();
        return docs.map(doc => ({ ...doc, id: (doc as any)._id.toString() }) as TSnippet);
    }

    async update(id: string, data: Partial<TSnippet>): Promise<TSnippet | null> {
        const { id: _, identifier: __, createdAt: ___, ...updateData } = data;
        await this._collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...updateData, updatedAt: new Date() } }
        );
        return this.getById(id);
    }

    async delete(id: string): Promise<void> {
        await this._collection.deleteOne({ _id: new ObjectId(id) });
    }
}
