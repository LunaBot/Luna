import { GuildMember as DiscordGuildMember } from 'discord.js';
import { log } from '../log';

type GuildMember = DiscordGuildMember & {
    pending: boolean;
};

export const guildMemberUpdate = async (oldMember: GuildMember, newMember: GuildMember) => {
    // Member passed membership screening
    if (oldMember.pending && !newMember.pending) {
        const role = newMember.guild.roles.cache.find(role => role.name.toLowerCase() === 'member');
        if (role) {
            newMember.roles.add(role);
        }
    }
};
