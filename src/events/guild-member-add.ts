import { GuildMember } from 'discord.js';
import { log } from '@/log';

export const guildMemberAdd = async (memeber: GuildMember) => {
    log.info('User @%s has joined the server!', memeber.user.tag);
};
