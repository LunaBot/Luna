import { client } from '@/client';
import { database } from '@/database';
import { envs } from '@/envs';
import { Server } from '@/servers';
import { sql } from '@databases/pg';
import { Guild } from 'discord.js';
import { v4 as uuid } from 'uuid';

// Bot was kicked from a server
export const guildDelete = async (guild: Guild) => {
    // Mark this server as un-enabled
    await Server.botRemoved(guild);

    // DM bot owner
    const owner = client.users.cache.get(envs.OWNER.ID);
    await owner?.send(`${guild.id} aka "${guild.name}" just added me.`);

    // Set bot's activity status
    const serversCount = await database.query<{ count: number }>(sql`SELECT COUNT(id) FROM servers;`).then(rows => rows[0].count);
    await client.user?.setActivity({
        name: `over ${serversCount} server${serversCount === 1 ? '' : 's'}`,
        type: 'WATCHING'
    });

    // Enable the setup command if it's a new add
    await database.query(sql`INSERT INTO commands (id, serverId, command, enabled) VALUES(${uuid()}, ${guild.id}, ${'setup'}, ${true}) ON CONFLICT (serverId,command) DO NOTHING;`);
};
