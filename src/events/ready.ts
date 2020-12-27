import humanizeDuration from 'humanize-duration';
import { client } from '../client';
import { envs } from '../envs';
import { database } from '../database';
import { sql } from '@databases/pg';
import { config } from '../config';
import { log } from '../log';
import { isNewsChannel, isTextChannel } from '../guards';

export const ready = async () => {
    // Set bot's activity status
    const serversCount = await database.query<{ count: number }>(sql`SELECT COUNT(id) FROM servers;`).then(rows => rows[0].count);
    await client.user?.setActivity(`moderating ${serversCount} server${serversCount === 1 ? '' : 's'}`);

    // Print Admin API key
    if (config.API_KEY_WAS_GENERATED) {
        log.debug(`Admin API key: ${config.ADMIN_API_KEY}`);
    }

    // Post "online" update in owner's server
    if (envs.OWNER.BOT_CHANNEL) {
        const channel = client.channels.cache.get(envs.OWNER.BOT_CHANNEL);
        if (channel && (isTextChannel(channel) || isNewsChannel(channel))) {
            const replies = [
                `I'm online!`,
                `Uptime: ${humanizeDuration(process.uptime() * 1000)}`,
                envs.BOT.COMMIT_HASH ? `Commit: ${envs.BOT.COMMIT_HASH}` : false,
            ].filter(Boolean).join('\n');
            await channel.send(replies);
        }
    }
};
