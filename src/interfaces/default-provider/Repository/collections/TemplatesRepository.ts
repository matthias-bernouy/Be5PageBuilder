import { ObjectId, type Collection, type Db } from "mongodb";
import type { TTemplate } from "src/interfaces/contract/Repository/TModels";

/**
 * MongoDB-backed persistence for page templates. Templates are keyed by
 * MongoDB ObjectId; the string `id` in the public model is a serialization
 * of `_id`.
 */
export class TemplatesRepository {

    private _collection: Collection<TTemplate>;

    constructor(database: Db) {
        this._collection = database.collection<TTemplate>("templates");
    }

    async create(template: TTemplate): Promise<TTemplate> {
        const result = await this._collection.insertOne(template as any);
        return { ...template, id: result.insertedId.toString() };
    }

    async getById(id: string): Promise<TTemplate | null> {
        const doc = await this._collection.findOne({ _id: new ObjectId(id) });
        if (!doc) return null;
        return { ...doc, id: (doc as any)._id.toString() } as TTemplate;
    }

    async getAll(): Promise<TTemplate[]> {
        const docs = await this._collection.find({}).toArray();
        return docs.map(doc => ({ ...doc, id: (doc as any)._id.toString() }) as TTemplate);
    }

    async update(id: string, data: Partial<TTemplate>): Promise<TTemplate | null> {
        const { id: _, ...updateData } = data;
        await this._collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        return this.getById(id);
    }

    async delete(id: string): Promise<void> {
        await this._collection.deleteOne({ _id: new ObjectId(id) });
    }
}
