import { Collection, Db, MongoClient } from "mongodb";
import type { PageBuilderRepository } from "src/interfaces/contract/Repository/PageBuilderRepository";
import type { TBloc, TPage, TSystem, TTemplate } from "src/interfaces/contract/Repository/TModels";
import { ObjectId } from "mongodb";
import type { TBlocMetadata } from "src/interfaces/contract/Repository/TQueries";


type DefaultDatastoreConfig = {
    uri: string;
    databaseName: string;
}

/**
 * @description This is a default implementation of the IDatastore interface.
 * @description It can be used for the production or for development.
 * @description This default implementation use mongodb as database.
 * 
 **/
export class DefaultPageBuilderRepository implements PageBuilderRepository {

    private _database: Db;
    private _blocsCollection: Collection<TBloc>;
    private _pagesCollection: Collection<TPage>;
    private _systemCollection: Collection<TSystem>;
    private _templatesCollection: Collection<TTemplate>;

    constructor(client: MongoClient, databaseName: string) {
        this._database = client.db(databaseName);
        this._blocsCollection = this._database.collection<TBloc>("blocs");
        this._pagesCollection = this._database.collection<TPage>("pages");
        this._systemCollection = this._database.collection<TSystem>("system");
        this._templatesCollection = this._database.collection<TTemplate>("templates");
    }

    static create(config: DefaultDatastoreConfig): Promise<DefaultPageBuilderRepository> {
        return new Promise((resolve, reject) => {
            new MongoClient(config.uri).connect().then(client => {
                const instance = new DefaultPageBuilderRepository(client, config.databaseName);
                resolve(instance);
            }).catch(err => {
                console.error("Failed to connect to the database", err);
                reject(err);
            });
        });
    }

    reset(): Promise<void> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this._blocsCollection.deleteMany({}),
                this._pagesCollection.deleteMany({}),
                this._systemCollection.deleteMany({})
            ]).then(() => {
                resolve();
            }).catch(err => {
                console.error("Failed to reset the database", err);
                reject(err);
            });
        });
    }

    createBloc(bloc: TBloc): Promise<TBloc> {
        return new Promise((resolve, reject) => {
            this._blocsCollection.insertOne(bloc).then(result => {
                if (result.acknowledged) {
                    resolve(bloc);
                } else {
                    reject(new Error("Failed to create bloc"));
                }
            }).catch(err => {
                console.error("Failed to create bloc", err);
                reject(err);
            });
        });
    }


    getBlocsMetadata(): Promise<TBlocMetadata[]> {
        return new Promise((resolve, reject) => {
            this._blocsCollection.find({}, { projection: { id: 1, name: 1, _id: 0 } }).toArray().then(blocs => {
                const metadata = blocs.map(bloc => ({
                    id: bloc.id,
                    name: bloc.name
                }));
                resolve(metadata);
            }).catch(err => {
                console.error("Failed to get blocs metadata", err);
                reject(err);
            });
        });
    }


    getBlocsEditorJS(): Promise<{ id: string, editorJS: string }[]> {
        return new Promise((resolve, reject) => {
            this._blocsCollection.find({}, { projection: { id: 1, editorJS: 1, _id: 0 } }).toArray().then(blocs => {
                const editorJS = blocs.map(bloc => ({
                    id: bloc.id,
                    editorJS: bloc.editorJS
                }));
                resolve(editorJS);
            }).catch(err => {
                console.error("Failed to get blocs editor JS", err);
                reject(err);
            });
        });
    }

    getBlocViewJS(id: string): Promise<string | null> {
        return new Promise((resolve, reject) => {
            this._blocsCollection.findOne({ id }, { projection: { viewJS: 1, _id: 0 } }).then(bloc => {
                if (bloc) {
                    resolve(bloc.viewJS);
                } else {
                    resolve(null);
                }
            }).catch(err => {
                console.error("Failed to get bloc view JS", err);
                reject(err);
            });
        });
    }


    async createPage(page: TPage, oldIdentifier?: string): Promise<TPage> {
        const filter = { identifier: oldIdentifier || page.identifier };

        try {
            const result = await this._pagesCollection.replaceOne(
                filter,
                page,
                { upsert: true }
            );

            if (result.acknowledged) {
                return page;
            } else {
                throw new Error("Upsert not acknowledged by MongoDB");
            }
        } catch (err) {
            console.error("Failed to upsert page:", err);
            throw err;
        }
    }


    getPageByIdentifier(identifier: string): Promise<TPage | null> {
        return new Promise((resolve, reject) => {
            this._pagesCollection.findOne({ identifier }).then(page => {
                if (page) {
                    resolve(page);
                } else {
                    resolve(null);
                }
            }).catch(err => {
                console.error("Failed to get page by identifier", err);
                reject(err);
            });
        });
    }


    getAllPages(): Promise<TPage[]> {
        return new Promise((resolve, reject) => {
            this._pagesCollection.find({}).toArray().then(pages => {
                resolve(pages);
            }).catch(err => {
                console.error("Failed to get all pages", err);
                reject(err);
            });
        });
    }


    async getSystem(): Promise<TSystem> {
        const doc = await this._systemCollection.findOne({});
        if (doc) return doc as TSystem;

        const defaults: TSystem = {
            initializationStep: 0,
            site: { name: "", theme: "", favicon: "", visible: true, homePage: "", page404: "", page500: "" },
            seo: { titleTemplate: "%s", defaultDescription: "", defaultOgImage: "" },
            editor: { blocAtPageCreation: "" },
        };
        await this._systemCollection.insertOne(defaults);
        return defaults;
    }

    async updateSystem(update: Partial<TSystem>): Promise<TSystem> {
        const flatUpdate: Record<string, any> = {};
        for (const [section, value] of Object.entries(update)) {
            if (section === "initializationStep") {
                flatUpdate[section] = value;
            } else if (typeof value === "object" && value !== null) {
                for (const [key, val] of Object.entries(value)) {
                    flatUpdate[`${section}.${key}`] = val;
                }
            }
        }

        await this._systemCollection.updateOne({}, { $set: flatUpdate }, { upsert: true });
        return this.getSystem();
    }

    // ── Templates ──

    async createTemplate(template: TTemplate): Promise<TTemplate> {
        const result = await this._templatesCollection.insertOne(template as any);
        return { ...template, id: result.insertedId.toString() };
    }

    async getTemplateById(id: string): Promise<TTemplate | null> {
        const doc = await this._templatesCollection.findOne({ _id: new ObjectId(id) });
        if (!doc) return null;
        return { ...doc, id: (doc as any)._id.toString() } as TTemplate;
    }

    async getAllTemplates(): Promise<TTemplate[]> {
        const docs = await this._templatesCollection.find({}).toArray();
        return docs.map(doc => ({ ...doc, id: (doc as any)._id.toString() }) as TTemplate);
    }

    async updateTemplate(id: string, data: Partial<TTemplate>): Promise<TTemplate | null> {
        const { id: _, ...updateData } = data;
        await this._templatesCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        return this.getTemplateById(id);
    }

    async deleteTemplate(id: string): Promise<void> {
        await this._templatesCollection.deleteOne({ _id: new ObjectId(id) });
    }

}