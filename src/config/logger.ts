import Sentry from './sentry';
import { ILogger } from '@wizeworks/graphql-factory-mongo';

export const logger: ILogger = {
    info: (message, meta) => {
        console.info(`[INFO] ${message}`, meta);
        Sentry.addBreadcrumb({
            message,
            level: 'info',
            data: meta,
        });
    },
    warn: (message, meta) => {
        console.warn(`[WARN] ${message}`, meta);
        Sentry.captureMessage(message, {
            level: 'warning',
            extra: meta,
        });
    },
    error: (error, meta) => {
        const message = typeof error === 'string' ? error : error.message;
        console.error(`[ERROR] ${message}`, meta);
        Sentry.captureException(
            error instanceof Error ? error : new Error(message),
            {
                extra: meta,
            }
        );
    },
    debug: (message, meta) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(`[DEBUG] ${message}`, meta);
            Sentry.addBreadcrumb({
                message,
                level: 'debug',
                data: meta,
            });
        }
    },
};
