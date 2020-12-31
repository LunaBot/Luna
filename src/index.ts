import express from 'express';
import importToArray from 'import-to-array';
import { client } from './client';
import * as endpoints from './endpoints';
import { envs } from './envs';
import { AppError } from './errors';
import * as events from './events';
import { log } from './log';

try {
    // No discord token
    if (!envs.BOT.TOKEN) {
        throw new AppError('No BOT_TOKEN env set!');
    }

    // No discord owner info
    if (!envs.OWNER.ID|| !envs.OWNER.SERVER) {
        throw new AppError('OWNER_ID and OWNER_SERVER envs both need to be set!');
    }

    const startWebEndpoints = () => {
        const app = express();
        const port = envs.WEB.PORT || 0;
        
        importToArray(endpoints).forEach(endpoint => {
            app.use(endpoint);
        });

        app.use((error: any, _request: any, response: any, next: any) => {
            if (response.headersSent) {
                return next(error);
            }

            const name = error.name ?? 'Error';
            const code = error.statusCode ?? 500;
            const message = error.message ?? 'Internal Server Error';
            response.status(code);

            
            // Production
            if (envs.NODE_ENV === 'production') {
                response.send({ status: { code, message }, error: { name, message } });
                return;
            }

            // Development/debug mode
            response.send({ status: { code, message }, error });
        });
    
        app.listen(port, () => {
            log.debug(`Server: http://localhost:${port}/`);
        });
    }

    // Start web endpoints
    try {
        startWebEndpoints();
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
} catch (error) {
    log.error('Failed to load bot: %s', error.message);
    process.exit();
}