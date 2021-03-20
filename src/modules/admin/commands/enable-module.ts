import { Command } from '@lunabot/kaspar';
import type { Message, Client } from 'discord.js';
import { CommandError } from '../../../errors';
import { Collection } from 'discord.js';

class EnableModule extends Command {
    public userPermissions = [Command.PERMISSIONS.ADMINISTRATOR];

    public paramaters = new Collection(Object.entries({
        moduleName: {
            type: 'number' as const
        },
        enabled: {
            type: 'boolean' as const
        }
    }));

    run(client: Client, message: Message, args: string[]): void {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

		// Let's get our key and value from the arguments.
		const [moduleName, ...value] = args;

		// Prevent the config being set to ""
		if (!moduleName || String(value).trim().length === 0) {
			throw new CommandError('Please provide a property and value.');
		}

		// Only allow loaded modules to be updated
		if (!client.modules.has(moduleName)) {
			throw new CommandError('This is not a valid module name.');
		}

        // Get module
        const module = client.modules.get(moduleName);
        
        // Prevent non-booleans getting through
        if (['yes', 'true', '1', 'no', 'false', '0'].includes(String(value).trim().toLowerCase())) {
            throw new CommandError(`Invalid value "${value}".`);
        }

        // Resolve state
        const state = ['yes', 'true', '1'].includes(String(value).trim().toLowerCase()) ? 'enable' : 'disable';

        // Enable module
        if (state === 'enable') {
		    client.settings.set(message.guild.id, true, `${moduleName}.enabled`);
        }

        // Disable module
        if (state === 'disable') {
            client.settings.set(message.guild.id, false, `${moduleName}.enabled`);
        }

		// Let the user know all is good.
		message.channel.send(`The \`${moduleName}\` module has been ${state}d.`);
	}
};

export const enableModule = new EnableModule();