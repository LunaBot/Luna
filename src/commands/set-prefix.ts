import type { Message } from 'discord.js';
import { AppError, InvalidCommandError } from '../errors';
import { Server } from '../servers';
import { Command } from '../command';

class SetPrefix extends Command {
    public name = 'set-prefix';
    public command = 'set-prefix';
    public timeout = 5000;
    public description = 'Change the bot\'s prefix. The default is `!`. Use `@automod reset-prefix` to reset.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public roles = [ 'test-role' ];

    async handler(_prefix: string, message: Message, args: string[]) {
        // We need at least 1 argument
        if (args.length === 0) {
            throw new InvalidCommandError(_prefix, 'set-prefix', args);
        }

        // We need no more than 1 character
        const prefix = args[0];
        if (prefix.length >= 2) {
            throw new AppError('prefix can only be a single character!');
        }

        const server = await Server.findOrCreate({ id: message.guild!.id });
        try {
            await server.setPrefix(prefix);
            return `Set prefix to \`${prefix}\``;
        } catch (error) {
            return `Failed updating prefix to \`${prefix}\``;
        }
    }
};

export default new SetPrefix();