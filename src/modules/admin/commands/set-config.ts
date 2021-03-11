import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { isAdmin, isOwner } from '../../../utils';
import { CommandError } from '../../../errors';
import { Collection } from 'discord.js';

const ensureType = (property: string, initalValue: any, newValue: any) => {
	const expectedType = typeof initalValue;
	if (expectedType === 'boolean') {
		const truthy = ['1', 'true', 'yes', 'on', 'enable', 'enabled'];
		const falsy = ['0', 'false', 'no', 'off', 'disable', 'disabled'];
		if (!truthy.includes(newValue) && !falsy.includes(newValue)) {
			throw new CommandError(`Failed changing \`${property}\` to \`${newValue}\` as it's not a ${expectedType}`);
		}

		// Convert to boolean
		return truthy.includes(newValue);
	}
	
	if (expectedType === 'number') {
		return parseInt(newValue.join(''), 10);
	}

	if (expectedType === 'object') throw new CommandError(`Failed changing \`${property}\` to \`${newValue}\` as it's not an object`);

	return newValue;
}

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
		const [prop, ...extras] = args;
		let value: any = extras.join(' ');
		// Example:
		// prop: "prefix"
		// value: ["+"]
		// (yes it's an array, we join it further down!)

		if (value.length >= 1000) {
			throw new CommandError(`Value is ${value.length} characters long, please use 1000 or less characters.`);
		}

		// Prevent the config being set to ""
		if (!prop || String(value).trim().length === 0) {
			throw new CommandError('Please provide a property and value.');
		}

		// Only allow existing keys to be updated
		if (!client.settings.has(message.guild.id, prop)) {
			throw new CommandError('This key is not in the configuration.');
		}

		// Validate type of value
		const oldValue = client.settings.get(message.guild.id, prop);
		if (Array.isArray(oldValue)) {
			// Split the string back apart
			value = value.split(' ');

			// Resolve each item in the array
			value = value.map(item => {
				try {
					return ensureType(prop, oldValue[0], item);
				} catch {}

				return undefined;
			}).filter(Boolean);
		} else {
			value = ensureType(prop, oldValue, value);
		}

		// Now we can finally change the value. Here we only have strings for values
		// so we won't bother trying to make sure it's the right type and such.
		client.settings.set(message.guild.id, value, prop);

		// Let the user know all is good.
		message.channel.send(`Guild \`${prop}\` has been changed to \`${value}\`.`);
	}
};

export const setConfig = new SetConfig();