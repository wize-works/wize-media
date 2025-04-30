import { generateUploadUrl } from '../utils/generateUploadUrl';
import { ObjectId } from 'mongodb';

function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/[^a-zA-Z0-9.\-_]/g, '-')   // replace invalid chars
        .toLowerCase();
}

export const uploadResolvers = {
    Query: {
        getImagesByProject: async (_: any, { projectId }: any, context: any) => {
            if (!context.tenantId) throw new Error("Missing tenantId in context");

            const db = context.mongo.db(context.database);
            const collection = db.collection('images');

            return await collection
                .find({ projectId, tenantId: context.tenantId })
                .sort({ createdAt: -1 })
                .toArray();
        },

        getVideosByProject: async (_: any, { projectId }: any, context: any) => {
            if (!context.tenantId) throw new Error("Missing tenantId in context");

            const db = context.mongo.db(context.database);
            const collection = db.collection('videos');

            return await collection
                .find({ projectId, tenantId: context.tenantId })
                .sort({ createdAt: -1 })
                .toArray();
        },

        getFilesByProject: async (_: any, { projectId }: any, context: any) => {
            if (!context.tenantId) throw new Error("Missing tenantId in context");

            const db = context.mongo.db(context.database);
            const collection = db.collection('files');

            return await collection
                .find({ projectId, tenantId: context.tenantId })
                .sort({ createdAt: -1 })
                .toArray();
        },
    },

    Mutation: {
        generateUploadUrl: async (_: any, { type, fileName }: { type: "images" | "videos" | "files", fileName: string }) => {
            return await generateUploadUrl(type, fileName);
        },

        registerImage: async (_: any, { input }: any, context: any) => {
            const db = context.mongo.db(context.database);
            const collection = db.collection('images');

            // Append timestamp to the file name (not the URL itself — it's already stored)
            const timestamp = Date.now();
            const sanitizedFileName = sanitizeFileName(input.fileName);
            const finalFileName = `${timestamp}-${sanitizedFileName}`;

            if (!context.tenantId) {
                throw new Error('Tenant ID is required to register a file.');
            }

            const imageDoc = {
                ...input,
                fileName: finalFileName,
                tenantId: context.tenantId,
                createdAt: new Date().toISOString(),
            };

            const result = await collection.insertOne(imageDoc);
            return {
                _id: result.insertedId,
                ...imageDoc,
            };
        },
        registerVideo: async (_: any, { input }: any, context: any) => {
            const db = context.mongo.db(context.database);
            const collection = db.collection('videos');

            const timestamp = Date.now();
            const sanitizedFileName = input.fileName
                .replace(/[^a-zA-Z0-9.\-_]/g, '-')
                .toLowerCase();
            const finalFileName = `${timestamp}-${sanitizedFileName}`;

            if (!context.tenantId) {
                throw new Error('Tenant ID is required to register a file.');
            }

            const videoDoc = {
                ...input,
                fileName: finalFileName,
                tenantId: context.tenantId,
                createdAt: new Date().toISOString(),
            };

            const result = await collection.insertOne(videoDoc);
            return {
                _id: result.insertedId,
                ...videoDoc,
            };
        },
        registerFile: async (_: any, { input }: any, context: any) => {
            const db = context.mongo.db(context.database);
            const collection = db.collection('files');

            const timestamp = Date.now();
            const sanitizedFileName = input.fileName
                .replace(/[^a-zA-Z0-9.\-_]/g, '-')
                .toLowerCase();
            const finalFileName = `${timestamp}-${sanitizedFileName}`;

            if (!context.tenantId) {
                throw new Error('Tenant ID is required to register a file.');
            }

            const fileDoc = {
                ...input,
                fileName: finalFileName,
                tenantId: context.tenantId,
                createdAt: new Date().toISOString(),
            };

            const result = await collection.insertOne(fileDoc);
            return {
                _id: result.insertedId,
                ...fileDoc,
            };
        },
    },
};
