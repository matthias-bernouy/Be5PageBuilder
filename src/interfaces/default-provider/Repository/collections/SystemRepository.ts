import type { Collection, Db } from "mongodb";
import type { TSystem } from "src/interfaces/contract/Repository/TModels";

export class SystemRepository {

    private _collection: Collection<TSystem>;

    constructor(database: Db) {
        this._collection = database.collection<TSystem>("system");
    }

    clear(): Promise<unknown> {
        return this._collection.deleteMany({});
    }

    async get(): Promise<TSystem> {
        const defaults: TSystem = {
            initializationStep: 0,
            site: {
                name: "",
                favicon: "",
                visible: true,
                host: "",
                language: "",
                theme: "",
                notFound: null,
                serverError: null,
            },
            editor: { layoutCategory: "" },
        };

        const doc = await this._collection.findOne({}) as any;
        if (!doc) {
            await this._collection.insertOne(defaults);
            return defaults;
        }

        const legacy = doc.site || {};

        const merged: TSystem = {
            initializationStep: doc.initializationStep ?? 0,
            site: {
                name: legacy.name ?? "",
                favicon: legacy.favicon ?? "",
                visible: legacy.visible ?? true,
                host: legacy.host ?? "",
                language: legacy.language ?? "",
                theme: legacy.theme ?? "",
                notFound: legacy.notFound ?? null,
                serverError: legacy.serverError ?? null,
            },
            editor: {
                layoutCategory: doc.editor?.layoutCategory ?? "",
            },
        };

        const hasStaleSubdocs =
            "home" in legacy ||
            "homePage" in legacy ||
            "page404" in legacy ||
            "page500" in legacy ||
            "seo" in doc ||
            (doc.editor && "blocAtPageCreation" in doc.editor);

        if (hasStaleSubdocs) {
            await this._collection.updateOne(
                {},
                {
                    $set: { site: merged.site, editor: merged.editor },
                    $unset: { seo: "" },
                }
            );
        }

        return merged;
    }

    async update(update: Partial<TSystem>): Promise<TSystem> {
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

        await this._collection.updateOne({}, { $set: flatUpdate }, { upsert: true });
        return this.get();
    }
}
