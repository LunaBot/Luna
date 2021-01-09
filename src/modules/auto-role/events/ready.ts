import { client } from '@/client';
import { database } from '@/database';
import { envs } from '@/envs';
import { log } from '@/log';
import { sleep } from '@/utils';
import { sql } from '@databases/pg';
import pMapSeries from 'p-map-series';
import { guildMemberUpdate } from './guild-member-update';

export const ready = async () => {
    // Only AutoRole on ready if we're in the production environment
    // There's no point in doing this if we're using the test/dev bot
    if (envs.NODE_ENV !== 'production') return;

    // Get the servers that have roles to apply
    const autoRoles = await database.query<{ count: number }>(sql`SELECT COUNT(*) FROM autoRoles WHERE enabled=${true}`).then(autoRoles => autoRoles[0]);

    // No auto roles setup
    if (autoRoles.count === 0) {
        log.silly(`Skipping as module it's not setup for any servers!`);
        return;
    }

    // Loop through all servers
    await pMapSeries(client.guilds.cache, async ([_, guild]) => {
        log.silly(`Got %s from the cache.`, guild.id);

        // Loop throgh all members
        await pMapSeries(await guild.members.fetch(), async ([_, member]) => {
            // See if they only have the @everyone role
            if (member.roles.cache.size === 1) {
                // Wait 1s between autoRolling
                await sleep(1);

                // Give them roles
                await guildMemberUpdate(member, member);
            }
        });
    });
};
