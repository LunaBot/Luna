import type { Client, GuildMember } from 'discord.js';
import { defaultSettings } from '../../../client';
import { sendWelcomeMessage } from '../../../utils';

// This executes when a member updates
export const guildMemberUpdate = async (client: Client, oldMember: GuildMember, newMember: GuildMember) => {
    // First, ensure the settings exist
    // @ts-expect-error
    const guildConfig = client.settings.ensure(member.guild.id)!;

    // Bail if this module is disabled
    if (!guildConfig?.welcome.enabled) return;

    // Member passed membership screening
    if (oldMember.pending && !newMember.pending) {
        sendWelcomeMessage(newMember);
    }
};
