import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { isAdmin, isOwner } from '../../../utils';
import { CommandError } from '../../../errors';
import { Collection } from 'discord.js';

class SetConfig implements Command {
    public name = 'set-config';
    public paramaters = new Collection(Object.entries({
        property: {
            type: 'string' as const
        },
        value: {
            type: 'string' as const
        }
    }));

    run(client: Client, message: Message, args: string[]): void {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

    	// Command is owner/admin only
        if (!isOwner(message.guild, message.member) && !isAdmin(message.guild, message.member)) {
            throw new CommandError('You\'re not an admin or the owner, sorry!');
        }

		// Let's get our key and value from the arguments.
		const [prop, ...value] = args;
		// Example:
		// prop: "prefix"
		// value: ["+"]
		// (yes it's an array, we join it further down!)

		// Prevent the config being set to ""
		if (!prop || String(value).trim().length === 0) {
			throw new CommandError('Please provide a property and value.');
		}

		// Only allow existing keys to be updated
		if (!client.settings.has(message.guild.id, prop)) {
			throw new CommandError('This key is not in the configuration.');
		}

		// Now we can finally change the value. Here we only have strings for values
		// so we won't bother trying to make sure it's the right type and such.
		client.settings.set(message.guild.id, value.join(' '), prop);

		// Let the user know all is good.
		message.channel.send(`Guild \`${prop}\` has been changed to \`${value.join(' ')}\`.`);
	}
};

export const setConfig = new SetConfig();