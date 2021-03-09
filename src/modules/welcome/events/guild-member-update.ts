import type { Client, GuildMember } from 'discord.js';
import { defaultSettings } from '../../../client';
import { sendWelcomeMessage } from '../../../utils';

// This executes when a member updates
export const guildMemberUpdate = async (client: Client, oldMember: GuildMember, newMember: GuildMember) => {
	// First, ensure the settings exist
	client.settings.ensure(newMember.guild.id, defaultSettings);

    // Member passed membership screening
    if (oldMember.pending && !newMember.pending) {
		sendWelcomeMessage(newMember);
    }
};
