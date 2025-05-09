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
import { GraphQLSchema } from 'graphql';
import { validateSchema } from 'graphql';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const database = process.env.DB_NAME || 'wize-media';
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
                let mediaSchemas: GraphQLSchema;
                try {
                    // Define a base schema with Query and Mutation types
                    const baseTypeDefs = `
                      type Query {
                        _empty: String
                      }
                      
                      type Mutation {
                        _empty: String
                      }
                    `;

                    console.log("Creating base schema...");

                    // First create a base schema with the types that will be extended
                    const baseSchema = makeExecutableSchema({
                        typeDefs: baseTypeDefs
                    });

                    console.log("Base schema created successfully");

                    // Then create uploadSchema that extends those types
                    console.log("Creating media schema...");
                    console.log("Upload typeDefs:", uploadTypeDefs);

                    mediaSchemas = makeExecutableSchema({
                        typeDefs: [baseTypeDefs, uploadTypeDefs],
                        resolvers: uploadResolvers,
                    });

                    console.log("Media schema created successfully");
                } catch (error) {
                    console.error("Media schema error:", error);
                    throw error;
                }
                try {
                    currentSchemas = mergeSchemas({
                        schemas: [factorySchema, mediaSchemas],
                    });
                    console.log("Schemas merged successfully");

                    // Validate the merged schema
                    const validationErrors = validateSchema(currentSchemas);
                    if (validationErrors.length > 0) {
                        console.error("Schema validation errors:", validationErrors);
                        throw new Error("Schema validation failed");
                    }
                }
                catch (error) {
                    console.error("Error merging schemas:", error);
                    return;
                }
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
        //maskedErrors: false,
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
