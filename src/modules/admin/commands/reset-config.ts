import { Command } from '@lunabot/kaspar';
import type { Message, Client } from 'discord.js';
import { isAdmin, isOwner } from '../../../utils';
import { CommandError } from '../../../errors';
import { defaultSettings } from '../../../client';

class ResetConfig extends Command {
    public userPermissions = [Command.PERMISSIONS.MANAGE_MESSAGES];

    run(client: Client, message: Message): void {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        client.settings.set(message.guild.id, defaultSettings);

        // Let the user know all is good.
        message.channel.send('Reset guild settings.');
    }
};

export const resetConfig = new ResetConfig();