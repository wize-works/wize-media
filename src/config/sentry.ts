import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0, // adjust in prod
    profileSessionSampleRate: 1.0, // adjust in prod
    profileLifecycle: 'trace',
    environment: process.env.NODE_ENV || 'development',
    attachStacktrace: true,
    integrations: [
        nodeProfilingIntegration(),
    ]

});

export default Sentry;
