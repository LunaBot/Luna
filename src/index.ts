import express from 'express';
import { envs } from './envs';
import { AppError } from './errors';
import * as events from './events';
import { log } from './log';
import { client } from './client';
import * as legacyEndpoints from './endpoints';
import { moduleManager } from './module-manager';
import importToArray from 'import-to-array';

const startWebEndpoints = async () => {
    const app = express();
    const port = envs.WEB.PORT || 0;

    // Mount module endpoints
    const modules = await moduleManager.getInstalledModules();
    modules.flatMap(_module => _module.endpoints).forEach(endpoint => {
        app.use(endpoint.endpoint);
    });

    // Mount legacy endpoints
    importToArray(legacyEndpoints).forEach(endpoint => {
        app.use(endpoint);
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
    if (!envs.OWNER.ID|| !envs.OWNER.SERVER) {
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
