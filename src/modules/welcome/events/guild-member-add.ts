import type { Client, GuildMember, GuildFeatures } from 'discord.js';
import { defaultSettings } from '../../../client';
import { sendWelcomeMessage } from '../../../utils';

// This executes when a member joins
export const guildMemberAdd = (client: Client, member: GuildMember) => {
    // First, ensure the settings exist
    client.settings.ensure(member.guild.id, defaultSettings);

    // If the guild is using the member verification gate then don't welcome them until they've passed
    if (member.guild.features.includes('MEMBER_VERIFICATION_GATE_ENABLED' as GuildFeatures)) {
        return;
    }

    // Send the welcome message
    sendWelcomeMessage(member);
};