import { Message } from 'discord.js';
import { AppError, InvalidCommandError } from '../errors';
import { getServer, saveServers } from '../servers';

export default {
    name: 'set-prefix',
    command: 'set-prefix',
    description: 'Change the bot\'s prefix. The default is `!`. Use `@automod reset-prefix` to reset.',
    hidden: false,
    owner: false,
    examples: [],
    roles: [
        'test-role'
    ],
    async handler(_prefix: string, _message: Message, args: string[]) {
        // We need at least 1 argument
        if (args.length === 0) {
            throw new InvalidCommandError(_prefix, 'set-prefix', args);
        }

        // We need no more than 1 character
        const prefix = args[0];
        if (prefix.length >= 2) {
            throw new AppError('prefix can only be a single character!');
        }

        const store = getServer(_message.guild?.id!);
        store.prefix = prefix;
        saveServers();
        return `set prefix to ${prefix}`;
    }
};
