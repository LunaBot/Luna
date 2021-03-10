import type { Client, Guild } from 'discord.js';

export const guildCreate = async (client: Client, guild: Guild) => {
    const guildsCount = client.guilds.cache.size;
    await client.user?.setActivity({
        name: `${guildsCount} server${guildsCount === 1 ? '' : 's'}`,
        type: 'WATCHING'
    });
};