import { sql } from '@databases/pg';
import { GuildMember } from 'discord.js';
import humanizeDuration from 'humanize-duration';
import { database } from '@/database';
import { sleep } from '@/utils';
import { AutoRole, RoleSummary } from '../types';
import { isRoleAndAction } from '../guards';
import { log } from '@/log';

export const guildMemberUpdate = async (_oldMember: GuildMember, newMember: GuildMember) => {
    const isMembershipScreeningEnabled = newMember.guild.features.includes('MEMBER_VERIFICATION_GATE_ENABLED');
    const query = sql`SELECT exists(SELECT enabled FROM autoRoles WHERE enabled=${true} AND serverId=${newMember.guild.id}) as enabled`;
    const autoRoleEnabled = await database.query<{ enabled: boolean }>(query).then(rows => rows[0].enabled);

    // No auto roles setup
    if (!autoRoleEnabled) {
        log.silly(`Skipping as module it's not setup for %s!`, newMember.guild.name);
        return;
    }

    // They already have at least one role
    // The reason we check for 2 roles is that
    // every discord user has the `@everyone` role
    if (newMember.roles.cache.size >= 2) return;

    // If screening is enabled on the server
    if (isMembershipScreeningEnabled && newMember.pending) {
        // Bail since they haven't passed the screening and it's currenty enabled
        return;
    }

    // If screening is enabled and they've passed
    if (isMembershipScreeningEnabled && _oldMember.pending && !newMember.pending) {
        log.silly('%s has now passed the membership screening.', newMember.user.username);
    }

    // Find role in cache
    const autoRoles = await database.query<AutoRole>(sql`SELECT * FROM autoRoles WHERE enabled=true AND serverId=${newMember.guild.id}`);
    const processedAutoRoles = await Promise.all(autoRoles.map(async autoRole => {
        const roles = await Promise.all(autoRole.roles.map(async roleIdOrName => {
            // Remove the +/- from the start of the role
            const action = roleIdOrName.substring(0, 1) === '+' ? 'add' : 'remove';
            const _roleIdOrName = roleIdOrName.substr(1);
            const role = newMember.guild.roles.cache.find(role => (role.id === _roleIdOrName) || (role.name.toLowerCase() === _roleIdOrName));
            return {
                role,
                action,
                missing: role === undefined
            };
        })).then(roles => roles.filter<RoleSummary>(isRoleAndAction));

        return {
            id: autoRole.id,
            timer: autoRole.timer,
            roles
        };
    }));

    log.silly(`Found %s role%s to apply.`, processedAutoRoles.length, processedAutoRoles.length === 1 ? '' : 's');

    // Run timers and role changing
    await Promise.all(processedAutoRoles.map(async autoRole => {
        // If timer wait for it to finish before adding changing roles
        if (autoRole.timer) {
            log.silly(`Waiting ${humanizeDuration(autoRole.timer)} before applying roles to %s.`, newMember.user.username);
            await sleep(autoRole.timer);
        }

        // This has been incorrectly setup since it has no roles
        // Let's disable it for now
        if (autoRole.roles.length === 0) {
            await database.query(sql`UPDATE autoRoles SET enabled=${false} WHERE id=${autoRole.id}`);
            return;
        }

        log.silly(`Attempting to apply "%s" to %s.`, autoRole.roles.join(', '), newMember.user.username);

        // Add/remove roles
        await Promise.all(autoRole.roles.map(async ({ role, action, missing }) => {
            // If the role is missing from the autorole rule then disable it
            if (missing) {
                await database.query(sql`UPDATE autoRoles SET enabled=${false} WHERE id=${autoRole.id}`);
                return;
            }
            if (action === 'add') {
                log.silly(`Added role "%s" to %s.`, role.name, newMember.user.username);
                await newMember.roles.add(role);
            } else {
                log.silly(`Removed role "%s" from %s.`, role.name, newMember.user.username);
                await newMember.roles.remove(role);
            }
        }));
    }));
};
