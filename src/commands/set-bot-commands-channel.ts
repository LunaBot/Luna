import { Message } from 'discord.js';
import { AppError, InvalidCommandError } from '../errors';
import { getServer } from '../servers';

export default {
    name: 'Set bot commands channel',
    command: 'set-bot-commands-channel',
    timeout: 5000,
    description: 'Set the room where the bot should post startup/shutdown messages.',
    hidden: false,
    owner: false,
    examples: [],
    roles: [
        'test-role'
    ],
    async handler(prefix: string, _message: Message, args: string[]) {
        // We need at least 1 argument
        if (args.length === 0) {
            throw new InvalidCommandError(prefix, 'set-bot-commands-channel', args);
        }

        // We need no more than 32 characters
        const commandsChannel = args[0];
        if (commandsChannel.length === 1 || commandsChannel.length >= 33) {
            throw new AppError('Invalid channel ID!');
        }

        const store = getServer(_message.guild?.id || 'default');
        store.channels.botCommands = commandsChannel;
        return `set commands channel to ${commandsChannel}`;
    }
};
