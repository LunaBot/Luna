import { getServer, serversCount } from '../servers';
import { client } from '../client';
import { config } from '../config';

export const ready = async () => {
    const store = getServer(config.OWNER.SERVER);
    const botCommandsChannel = store.channels.botCommands;

    if (!botCommandsChannel) {
        return;
    }
    const channel = client.channels.cache.get(botCommandsChannel);
    if (channel?.type === 'text') {
        // @ts-ignore
        channel?.send(`I'm online!`);
    }

    // Set bot's activity status
    await client.user?.setActivity(`moderating ${serversCount} server${serversCount === 1 ? '' : 's'}`);
};
