import * as events from './events';
import { client } from './client';
import { config } from './config';
import { saveServers } from './servers';
import { log } from './log';
import { AppError } from './errors';

try {
    // No discord token
    if (!process.env.BOT_TOKEN) {
        throw new AppError('No BOT_TOKEN env set!');
    }

    // No discord owner info
    if (!process.env.OWNER_ID|| !process.env.OWNER_SERVER) {
        throw new AppError('OWNER_ID and OWNER_SERVER envs both need to be set!');
    }

    // Register all events
    Object.entries(events).forEach(([eventName, eventHandler]) => {
        client.on(eventName, (...args: any[]) => {
            // Emit "error" event on promise rejection
            // @ts-expect-error
            Promise.resolve(eventHandler.call(eventHandler, ...args)).catch(error => {
                client.emit('error', error);
            });
        });
    });

    // Login to the bot
    client.login(config.BOT_TOKEN).then(() => {
        // Success we're online!
        log.debug('@automod online!');
    });
} catch (error) {
    log.error('Failed to load bot: %s', error.message);
}

// Offload store to file on exit
process.on('SIGINT', () => {
    saveServers();
    process.exit();
});
