import git from 'git-rev-sync';
import humanizeDuration from 'humanize-duration';
import { client, statcord } from '@/client';
import { config } from '@/config';
import { database } from '@/database';
import { envs } from '@/envs';
import { isNewsChannel, isTextChannel } from '@/guards';
import { log } from '@/log';
import { sql } from '@databases/pg';

export const ready = async () => {    
    // Let statcord know
    statcord.autopost();

    const environment = envs.ENVIRONMENT.toLowerCase();
    const username = client.user?.username
    const potentialUsername = `AutoMod - ${environment.substring(0, 1).toUpperCase()}${environment.substring(1).toLowerCase()}`;

    // Username should match the environment
    if (username !== potentialUsername) {
        log.warn(`Incorrect username, currently is "${username}" should be "${potentialUsername}"`);
    }

    // Set bot's activity status
    const serversCount = await database.query<{ count: number }>(sql`SELECT COUNT(id) FROM servers;`).then(rows => rows[0].count);
    await client.user?.setActivity({
        name: `over ${serversCount} server${serversCount === 1 ? '' : 's'}`,
        type: 'WATCHING'
    });

    // Print Admin API key
    if (config.API_KEY_WAS_GENERATED) {
        log.debug(`Admin API key: ${envs.ADMIN.HIDE_KEYS ? config.ADMIN_API_KEY.replace(/./g, '*') : config.ADMIN_API_KEY}`);
    }

    // Set online
    await client.user?.setStatus('online');

    // Post "online" update in owner's server
    if (envs.OWNER.BOT_CHANNEL) {
        const channel = client.channels.cache.get(envs.OWNER.BOT_CHANNEL);
        if (channel && (isTextChannel(channel) || isNewsChannel(channel))) {
            const replies = [
                `Version \`${envs.BOT.COMMIT_HASH || git.short()}\` deployed!`,
                `Took ${humanizeDuration(process.uptime() * 1000)} to start!`
            ].filter(Boolean).join('\n');
            await channel.send(replies);
        }
    }
};
