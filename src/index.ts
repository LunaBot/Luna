import * as events from './events';
import { client } from './client';
import { config } from './config';
import { saveServers } from './servers';
import { log } from './log';

try {
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
    client.login(config.BOT_TOKEN);

    // Success we're online!
    log.debug('@automod online!');
} catch (error) {
    log.error('Failed to load bot: %s', error.message);
}

// Offload store to file on exit
process.on('SIGINT', () => {
    saveServers();
    process.exit();
});
