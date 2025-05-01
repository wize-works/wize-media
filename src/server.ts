// src/server.ts

import './config/dotenv';

import Sentry from './config/sentry';
import express from 'express';
import { MongoClient } from 'mongodb';
import { createYoga } from 'graphql-yoga';
import { createServerSchema, createServerContext, registerSchemaRoutes, registerAdminRoutes } from '@wizeworks/graphql-factory-mongo';
import { logger } from './config/logger';
import { registerCors } from './config/cors';
import { useFormattedErrors } from './utils/formatError';
import { mergeSchemas } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { uploadTypeDefs } from './graphql/uploadSchema';
import { uploadResolvers } from './graphql/uploadResolver';
import { typeDefs } from 'graphql-scalars';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const database = process.env.DB_NAME || 'wize-example';
const mongoClient = new MongoClient(MONGO_URI);
let currentSchemas: any = null;

const start = async () => {
    await mongoClient.connect();
    logger.info?.('MongoDB connected');
    logger.info?.(`Using database: ${database}`);

    const yoga = createYoga({
        graphqlEndpoint: '/graphql',
        schema: async ({ request }) => {
            if (!currentSchemas) {
                const apiKey: string = request.headers.get('wize-api-key') || '';
                const factorySchema = await createServerSchema(
                    apiKey,
                    mongoClient,
                    database
                );
                const mediaSchemas = makeExecutableSchema({
                    typeDefs: uploadTypeDefs,
                    resolvers: uploadResolvers,
                });
                currentSchemas = mergeSchemas({
                    schemas: [factorySchema, mediaSchemas],
                });
            }
            return currentSchemas;
        },
        context: async ({ request }) => {
            const baseContext = await createServerContext(request, mongoClient);
            return {
                ...baseContext,
                database,
            };
        },
        graphiql: true,
        maskedErrors: false,
        plugins: [useFormattedErrors()],
    });

    const app = express();
    app.use(express.json());

    registerCors(app);

    registerSchemaRoutes(app, mongoClient, database);
    registerAdminRoutes(app, mongoClient, currentSchemas, database);

    // Use Yoga as middleware in Express
    app.use(yoga.graphqlEndpoint, yoga);

    Sentry.setupExpressErrorHandler(app);
    logger.error?.('Sentry error handler registered');
    app.listen(port, () => {
        console.log(
            `🚀 wize-media API ready at http://localhost:${port}/graphql`
        );
    });
};

start()
    .then(() => {
        logger.info?.('Wize Media Server started');
    })
    .catch((error) => {
        logger.error?.('Error starting server:', error);
        process.exit(1);
    });
