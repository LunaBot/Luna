import type { Client, GuildMember } from 'discord.js';
import { sendWelcomeMessage } from '../../../utils';

// This executes when a member updates
export const guildMemberUpdate = async (client: Client, member: GuildMember, newMember: GuildMember) => {
    // First, ensure the settings exist
    // @ts-expect-error
    const guildConfig = client.settings.ensure(member.guild.id)!;

    // Bail if this module is disabled
    if (!guildConfig?.welcome.enabled) return;

    // Member passed membership screening
    if (member.pending && !newMember.pending) {
        sendWelcomeMessage(newMember);
    }
};
