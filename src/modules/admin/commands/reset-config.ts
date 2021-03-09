import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { isAdmin, isOwner } from '../../../utils';
import { CommandError } from '../../../errors';
import { defaultSettings } from '../../../client';

class ResetConfig implements Command {
    public name = 'reset-config';

    run(client: Client, message: Message) {
        // Bail unless we're in a guild and a member run this
        if (!message.guild || !message.member) return;

    	// Command is owner/admin only
        if (!isOwner(message.guild, message.member) && !isAdmin(message.guild, message.member)) {
            throw new CommandError('You\'re not an admin or the owner, sorry!');
        }

        client.settings.set(message.guild.id, defaultSettings);

        // Let the user know all is good.
        message.channel.send('Reset guild settings.');
    }
};

export const resetConfig = new ResetConfig();