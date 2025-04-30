import { Plugin } from 'graphql-yoga';
import { HttpError } from '@wizeworks/graphql-factory-mongo';

export function useFormattedErrors(): Plugin {
    return {
        onPluginInit({ addPlugin }) {
            addPlugin({
                onExecute({ setResultAndStopExecution }) {
                    return {
                        onExecuteDone({ result }) {
                            if (
                                'errors' in result &&
                                Array.isArray(result.errors)
                            ) {
                                result.errors = result.errors.map((err) => {
                                    const original =
                                        err.originalError as HttpError;
                                    return {
                                        message: err.message,
                                        path: err.path,
                                        extensions: {
                                            code:
                                                original?.code ||
                                                'INTERNAL_SERVER_ERROR',
                                            http: {
                                                status:
                                                    original?.statusCode || 500,
                                            },
                                        },
                                    };
                                });
                            }
                        },
                    };
                },
            });
        },
    };
}
