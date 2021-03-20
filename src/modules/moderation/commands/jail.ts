import { Command } from '@lunabot/kaspar';
import type { Message, Client } from 'discord.js';
import { isAdmin, isOwner } from '../../../utils';
import { CommandError } from '../../../errors';
import { Collection } from 'discord.js';
import { mute } from './mute';
import { createJailCellChannel } from '../utils/create-jail-cell-channel';

class Jail extends Command {
    public paramaters = new Collection(Object.entries({
        user: {
            type: 'mention' as const
        },
        reason: {
            type: 'string' as const
        }
    }));

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

    	// Command is owner/admin only
        if (!isOwner(message.guild, message.member) && !isAdmin(message.guild, message.member)) {
            throw new CommandError('You\'re not an admin or the owner, sorry!');
        }

        // Get the user we need to jail
        const memberToJail = message.mentions.members?.first();

        // Bail if we don't have someone to jail
        if (!memberToJail) throw new CommandError('You need to mention a user to jail them!');

        // Mute them
        await mute.run(client, message, args);

        // Jail them
        await createJailCellChannel(client, message);
    }
}

export const jail = new Jail();