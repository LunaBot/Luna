import { sql } from '@databases/pg';
import git from 'git-rev-sync';
import humanizeDuration from 'humanize-duration';
import { client } from '../client';
import { config } from '../config';
import { database } from '../database';
import { envs } from '../envs';
import { isNewsChannel, isTextChannel } from '../guards';
import { log } from '../log';

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
                `Version ${envs.BOT.COMMIT_HASH || git.short()} deployed!`,
                `Took ${humanizeDuration(process.uptime() * 1000)} to start!`
            ].filter(Boolean).join('\n');
            await channel.send(replies);
        }
    }
};
