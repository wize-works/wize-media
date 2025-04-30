var cors = require('cors');
import express from 'express';

export const registerCors = (app: express.Application) => {
    const allowedOrigins = [
        'https://app.jobsight.co',
        'https://jobsight.co',
        'https://kzmpro8otme7p0t8em3m.lite.vusercontent.net'
    ];


    const corsOptionsDelegate = function (req: { header: (arg0: string) => any; }, callback: (arg0: null, arg1: { origin: boolean; methods?: string[]; allowedHeaders?: string[]; credentials?: boolean; }) => void) {
        const origin = req.header('Origin');
        if (allowedOrigins.includes(origin)) {
            callback(null, {
                origin: true, // Reflect the request origin
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization', 'wize-api-key'],
                credentials: true
            });
        } else {
            callback(null, { origin: false }); // Disallow other origins
        }
    };
    app.use(cors(corsOptionsDelegate));
}