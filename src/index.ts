import { messageHandler } from './message-handler';
import { client } from './client';
import { config } from './config';
import { getStore, saveStore } from './store';

try {
    // Handle messages
    client.on('message', messageHandler);

    // Handle startup message
    client.on('ready', () => {
        const store = getStore('default');
        const botCommandsChannel = store.channels.botCommands;

        if (!botCommandsChannel) {
            return;
        }
        const channel = client.channels.cache.get(botCommandsChannel);
        // @ts-ignore
        channel?.send(`I'm online!`);
    });

    // Login to the bot
    client.login(config.BOT_TOKEN);

    // Success we're online!
    console.info('@automod online!');
} catch (error) {
    console.error(`Failed to load bot: %s`, error.message);
}

// Offload store to file on exit
process.on('SIGINT', () => {
    saveStore();
    process.exit();
});
