import type { Be5_Runner, Runner } from "@bernouy/socle";
import { MongoClient, type Collection, type Db, ObjectId, Binary } from "mongodb";
import sharp from "sharp";
import type {
    MediaDocument,
    MediaFilter,
    MediaFolder,
    MediaImage,
    MediaItem,
    MediaRepository
} from "src/contracts/Media/MediaRepository";
import MediaEndpoints from "./MediaEndpoints";
import { VariantCache } from "./VariantCache";
import { LADDER_SET } from "src/server/imageOptimization/imageLadder";

type Config = {
    uri: string;
    databaseName: string;
}

// Bound the on-demand variant cache. 200 distinct variants × 100 MB total is
// enough headroom for a typical page (a handful of images × the ladder
// rungs the browser actually picks per breakpoint) without letting a busy
// site balloon the heap.
const VARIANT_CACHE_MAX_ENTRIES = 200;
const VARIANT_CACHE_MAX_BYTES = 100 * 1024 * 1024;

export class DefaultMediaRepository implements MediaRepository {
    private _database: Db;
    private _mediaCollection: Collection<any>;
    private _variantCache = new VariantCache(VARIANT_CACHE_MAX_ENTRIES, VARIANT_CACHE_MAX_BYTES);

    label: string;

    constructor(label: string, client: MongoClient, databaseName: string, runner: Runner) {
        this.label = label;
        this._database = client.db(databaseName);
        this._mediaCollection = this._database.collection("mediacenter");
        MediaEndpoints(runner, this);
    }

    get variantCache(): VariantCache {
        return this._variantCache;
    }

    static async create(label: string, config: Config, runner: Runner): Promise<DefaultMediaRepository> {
        const client = await new MongoClient(config.uri).connect();
        return new DefaultMediaRepository(label, client, config.databaseName, runner);
    }

    async reset(): Promise<void> {
        try {
            await this._mediaCollection.deleteMany({});
            this._variantCache.clear();
        } catch (err) {
            console.error("Failed to reset the database", err);
            throw err;
        }
    }

    async updateMetadata(id: string, data: Partial<MediaItem>): Promise<void> {
        const { id: _, type: __, ...updates } = data as any;

        await this._mediaCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );
        // Metadata edits don't change image bytes today, but they could
        // (alt-text rewrites notwithstanding, anything that touches the
        // stored content would invalidate every cached variant). Wiping the
        // id's prefix here keeps the contract honest and cheap.
        this._variantCache.invalidatePrefix(VariantCache.prefixFor(id));
    }

    async moveItem(id: string, newParentId?: string): Promise<void> {
        await this._mediaCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { parent: newParentId ? newParentId : null } }
        );
    }

    async deleteItem(id: string): Promise<void> {
        const objectId = new ObjectId(id);
        const item = await this._mediaCollection.findOne({ _id: objectId });

        if (!item) return;

        if (item.type === "folder") {
            await this._deleteFolderRecursive(id);
        } else {
            await this._mediaCollection.deleteOne({ _id: objectId });
            this._variantCache.invalidatePrefix(VariantCache.prefixFor(id));
        }
    }

    private async _deleteFolderRecursive(folderId: string): Promise<void> {
        const children = await this._mediaCollection.find({ parent: folderId }).toArray();
        for (const child of children) {
            if (child.type === "folder") {
                await this._deleteFolderRecursive(child._id.toString());
            } else {
                await this._mediaCollection.deleteOne({ _id: child._id });
                this._variantCache.invalidatePrefix(VariantCache.prefixFor(child._id.toString()));
            }
        }
        await this._mediaCollection.deleteOne({ _id: new ObjectId(folderId) });
    }

    async getItems(parent?: string, filter?: MediaFilter): Promise<Omit<MediaItem, 'content'>[]> {
        const query: any = {};

        query.parent = parent || null;

        if (filter) {
            if (filter.type && filter.type.length > 0) {
                query.type = { $in: filter.type };
            }
            if (filter.text) {
                const escaped = filter.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                query.label = { $regex: escaped, $options: "i" };
            }
        }

        const coll = (this as any)._collection?.() ?? this._mediaCollection;
        const docs = await coll.find(query, { projection: { content: 0 } }).toArray();

        return docs.map((doc: { _id: ObjectId } & Record<string, unknown>) => {
            const { _id, ...rest } = doc;
            return {
                ...rest,
                id: _id.toString(),
            };
        }) as Omit<MediaItem, 'content'>[];
    }

    async createFolder(label: string, parent?: string): Promise<MediaFolder> {
        const newFolder = {
            label: label,
            _id: new ObjectId(),
            type: "folder" as const,
            parent: parent || null,
            createdAt: new Date(),
        };

        await this._mediaCollection.insertOne(newFolder);

        return {
            id: newFolder._id.toString(),
            type: newFolder.type,
            label: newFolder.label,
            parent: newFolder.parent ?? null,
            createdAt: newFolder.createdAt
        };
    }


    async upload(file: File, parent?: string): Promise<MediaDocument | MediaImage> {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const isImage = file.type.startsWith("image/");

        const _id = new ObjectId();
        const baseData = {
            _id,
            label: file.name,
            mimetype: file.type,
            parent: parent || null,
            size: file.size,
            createdAt: new Date(),
        };

        let finalDoc: any;

        const isSvg = file.type === "image/svg+xml";

        if (isImage && !isSvg) {
            const metadata = await sharp(buffer).metadata();
            finalDoc = {
                ...baseData,
                type: "image" as const,
                alt: file.name,
                width: metadata.width ?? 0,
                height: metadata.height ?? 0,
            };
        } else if (isSvg) {
            finalDoc = {
                ...baseData,
                type: "image" as const,
                alt: file.name,
                width: 0,
                height: 0,
            };
        } else {
            finalDoc = {
                ...baseData,
                type: "other" as const,
            };
        }

        await this._mediaCollection.insertOne({
            ...finalDoc,
            content: new Binary(buffer)
        });

        return {
            ...finalDoc,
            id: _id.toString(),
            content: new Uint8Array(arrayBuffer)
        } as MediaImage | MediaDocument;
    }

    async getItem(id: string): Promise<MediaItem | null> {
        const doc = await this._mediaCollection.findOne({ _id: new ObjectId(id) });

        if (!doc) return null;

        return {
            ...doc,
            id: doc._id.toString(),
            content: doc.content ? new Uint8Array(doc.content.buffer) : undefined
        } as MediaItem;
    }

    async getResponse(id: string, opts?: {
        w?: number,
        h?: number
    }): Promise<Response> {
        try {
            const w = opts?.w;
            const h = opts?.h;
            // Same allow-list as the public /media handler — keeps the
            // contract entry point honest if a custom server bypasses the
            // URL validator and calls getResponse directly.
            if ((w !== undefined && !LADDER_SET.has(w)) || (h !== undefined && !LADDER_SET.has(h))) {
                return new Response("Invalid dimension", { status: 400 });
            }

            const item = await this.getItem(id);

            if (!item || item.type === "folder") {
                return new Response("Media not found", { status: 404 });
            }

            const media = item as MediaDocument;
            let body = media.content as any;
            const headers = new Headers({
                "Content-Type": media.mimetype,
                "Cache-Control": "public, max-age=31536000, immutable",
            });

            // Handle image resizing
            if (media.type === "image" && (w || h)) {
                const cacheKey = VariantCache.keyFor(id, w, h);
                const cached = this._variantCache.get(cacheKey);
                if (cached) {
                    body = cached;
                } else {
                    const resized = await sharp(media.content)
                        .resize(w, h, {
                            fit: 'inside',
                            withoutEnlargement: true
                        })
                        .toBuffer();
                    const bytes = new Uint8Array(resized.buffer, resized.byteOffset, resized.byteLength);
                    this._variantCache.set(cacheKey, bytes);
                    body = bytes;
                }
            } else if (media.type !== "image") {
                headers.set("Content-Disposition", `inline; filename="${media.label}"`);
            }

            return new Response(body, {
                status: 200,
                headers: headers
            });

        } catch (err) {
            console.error("Error serving media:", err);
            return new Response("Internal Server Error", { status: 500 });
        }
    }
}