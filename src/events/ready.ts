import { getServer, serversCount } from '../servers';
import { client } from '../client';
import { envs } from '../envs';

export const ready = async () => {
    // Set bot's activity status
    await client.user?.setActivity(`moderating ${serversCount} server${serversCount === 1 ? '' : 's'}`);

    const server = getServer(envs.OWNER.SERVER);
    const botCommandsChannel = server.channels.botCommands;

    if (!botCommandsChannel) {
        return;
    }
    const channel = client.channels.cache.get(botCommandsChannel);
    if (channel?.type === 'text') {
        // @ts-ignore
        channel?.send(`I'm online!`);
    }
};
