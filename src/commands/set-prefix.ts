import { Message } from 'discord.js';
import { AppError, InvalidCommandError } from '../errors';
import { getStore } from '../store';

export default {
    name: 'set-prefix',
    command: 'set-prefix',
    description: 'Change the bot\'s prefix. The default is `!`. Use `@automod reset-prefix` to reset.',
    roles: [
        'test-role'
    ],
    async handler(message: Message, args: string[]) {
        // We need at least 1 argument
        if (args.length === 0) {
            throw new InvalidCommandError('set-prefix', args);
        }

        // We need no more than 1 character
        const prefix = args[0];
        if (prefix.length >= 2) {
            throw new AppError('prefix can only be a single character!');
        }

        const store = getStore('default');
        store.prefix = prefix;
        return `set prefix to ${prefix}`;
    }
};
