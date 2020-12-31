import { sql } from '@databases/pg';
import { GuildMember as DiscordGuildMember, Role } from 'discord.js';
import humanizeDuration from 'humanize-duration';
import { database } from '../database';
import { log } from '../log';

type GuildMember = DiscordGuildMember & {
    pending: boolean;
};

interface AutoRole {
    id: String;
    serverId: String;
    roles: String[];
    timer: number;
}

const sleep = (seconds: number) => new Promise<void>(resolve => {
    setTimeout(() => resolve(), seconds);
});

interface RoleAndAction {
    role: Role,
    action: 'add' | 'remove'
};

const isRoleAndAction = (object: any): object is RoleAndAction => object.role instanceof Role;

export const guildMemberUpdate = async (oldMember: GuildMember, newMember: GuildMember) => {
    const autoRoles = await database.query<AutoRole>(sql`SELECT * FROM autoRoles WHERE enabled=true AND serverId=${oldMember.guild.id}`);

    // No auto roles setup
    if (autoRoles.length === 0) {
        log.silly(`Skipping autoroles as it's not setup for this server!`);
        return;
    }

    // Member passed membership screening
    if (oldMember.pending && !newMember.pending) {
        log.silly(`%s has now passed the membership screening, running "AutoRole" module.`, newMember.user.username);

        // Find role in discord.js cache
        const processedAutoRoles = await Promise.all(autoRoles.map(async autoRole => {
            const roles = await Promise.all(autoRole.roles.map(async roleIdOrName => {
                // Remove the +/- from the start of the role
                const action = roleIdOrName.substring(0, 1) === '+' ? 'add' : 'remove';
                const _roleIdOrName = roleIdOrName.substr(1);
                const role = newMember.guild.roles.cache.find(role => (role.id === _roleIdOrName) || (role.name.toLowerCase() === _roleIdOrName));
                return {
                    role,
                    action
                };
            })).then(roles => roles.filter<RoleAndAction>(isRoleAndAction));

            return {
                timer: autoRole.timer,
                roles
            };
        }));

        log.silly(`Found %s auto roles to apply.`, processedAutoRoles.length);

        // Run timers and role changing
        await Promise.all(processedAutoRoles.map(async autoRole => {
            // If timer wait for it to finish before adding changing roles
            if (autoRole.timer) {
                log.silly(`Waiting ${humanizeDuration(autoRole.timer)} before applying roles to %s.`, newMember.user.username);
                await sleep(autoRole.timer);
            }

            // Add/remove roles
            await Promise.all(autoRole.roles.map(async ({ role, action }) => {
                if (action === 'add') {
                    log.silly(`Added role "%s" to %s.`, role.name, newMember.user.username);
                    await newMember.roles.add(role);
                } else {
                    log.silly(`Removed role "%s" from %s.`, role.name, newMember.user.username);
                    await newMember.roles.remove(role);
                }
            }));
        }));
    }
};
