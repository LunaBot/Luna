import express, { Router, Application } from 'express';
import path from 'path';
import { envs } from './envs';
import { AppError } from './errors';
import * as events from './events';
import { log } from './log';
import { client } from './client';
import * as legacyEndpoints from './endpoints';
import { moduleManager } from './module-manager';
import history from 'connect-history-api-fallback';
import crypto from 'crypto';
import passport from 'passport';
import expressSession from 'express-session';
import cookieParser from 'cookie-parser';
import serveStatic from 'serve-static';
import bodyParser from 'body-parser';
import * as httpStatuses from 'http-status';
import { loadAuthentication } from './authentication';
import { isInGuilds } from './middleware';

/**
 * Takes an imported module and converts it to an array of it's own entries.
 * Excludes the ES6 / TypeScript "__esModule" property.
 */
const purifiedImports = <Key extends string, PropType>(importObject: Record<Key, PropType>): { [k: string]: PropType; } => {
    return Object.fromEntries((Object.entries(importObject) as [string, PropType][]).filter(([key]) => !key.startsWith('__')));
};

type Endpoint = [string, Router | Endpoint];
const processEndpoints = (app: Application) => ([name, router]: Endpoint): void => {
    // Array of endpoints
    if (Array.isArray(router)) {
        return processEndpoints(app)(router);
    }

    // Single router
    app.use(`/${name}`, router);
};

const startWebEndpoints = async () => {
    const app = express();
    const port = envs.WEB.PORT || 0;
    const frontendFiles = path.resolve(__dirname, '..', 'frontend/dist');
    const historyMiddleware = history({
        verbose: true,
        disableDotRule: true,
        index: '/index.html'
    });

    // Serve frontend files
    app.use(serveStatic(frontendFiles));

    // Support history api 
    app.use((req, res, next) => {
        if (req.path.startsWith('/auth') || req.path.startsWith('/api')) {
          next();
        } else {
          historyMiddleware(req, res, next);
        }
    });

    // 2nd static files call for redirected requests
    app.use(serveStatic(frontendFiles));

    // Handle cookies, sessions, etc.
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(expressSession({
        secret: crypto.randomBytes(64).toString('hex'),
        resave: true,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    // Load auth providers into passport
    loadAuthentication();

    // Check user is in guild
    app.use(isInGuilds);

    // Mount module endpoints
    const modules = await moduleManager.getInstalledModules();
    modules.flatMap(_module => _module.endpoints).forEach(endpoint => {
        app.use(endpoint.endpoint);
    });

    // Mount legacy endpoints
    Object.entries(purifiedImports(legacyEndpoints)).forEach(processEndpoints(app));

    // Show the endpoints we have registered
    app.use('/api/endpoints', (_request, response) => {
        return response.send(require('express-list-endpoints')(app));
    });

    // Mount error handler
    app.use((error: any, _request: any, response: any, next: any) => {
        if (response.headersSent) {
            return next(error);
        }

        const name = error.name ?? 'Error';
        const code = error.code ?? 500;
        const message = error.message ?? 'Internal Server Error';
        response.status(code);

        // Production
        if (envs.NODE_ENV === 'production') {
            response.send({ status: { code, message: httpStatuses[code] }, error: { name, message } });
            return;
        }

        // Development/debug mode
        response.send({ status: { code, message }, error });
    });

    // Start web server
    app.listen(port, () => {
        log.debug(`Server: http://localhost:${port}/`);
    });
}

const main = async () => {
    // No discord token
    if (!envs.BOT.TOKEN) {
        throw new AppError('No BOT_TOKEN env set!');
    }

    // No discord owner info
    if (!envs.OWNER.ID || !envs.OWNER.SERVER) {
        throw new AppError('OWNER_ID and OWNER_SERVER envs both need to be set!');
    }

    // Start web endpoints
    try {
        await startWebEndpoints();
    } catch (error) {
        log.error('Failed loading web endpoints', error);
    }

    // Register all events
    Object.entries(events ?? {}).forEach(([eventName, eventHandler]) => {
        client.on(eventName, (...args: any[]) => {
            // Emit "error" event on promise rejection
            // @ts-expect-error
            Promise.resolve(eventHandler.call(eventHandler, ...args)).catch(error => {
                // Add event name so we can more easily identify this when we log it out
                error.extras = {
                    eventName
                };
                client.emit('error', error);
            });
        });
    });

    // Login to the bot
    client.login(envs.BOT.TOKEN).then(() => {
        // Success we're online!
        log.debug('@automod online!');
    });
};

main().catch(error => {
    log.error('Failed to load bot: %s', error.message);
    process.exit();
});
