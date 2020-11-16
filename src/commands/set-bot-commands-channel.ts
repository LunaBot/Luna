import { Message } from 'discord.js';
import { AppError, InvalidCommandError } from '../errors';
import { getStore } from '../store';

export default {
    name: 'set-bot-commands-channel',
    command: 'set-bot-commands-channel',
    description: 'Set the room where the bot should post startup/shutdown messages.',
    roles: [
        'test-role'
    ],
    async handler(message: Message, args: string[]) {
        // We need at least 1 argument
        if (args.length === 0) {
            throw new InvalidCommandError('set-bot-commands-channel', args);
        }

        // We need no more than 32 characters
        const commandsChannel = args[0];
        if (commandsChannel.length === 1 || commandsChannel.length >= 33) {
            throw new AppError('Invalid channel ID!');
        }

        const store = getStore('default');
        store.channels.botCommands = commandsChannel;
        return `set commands channel to ${commandsChannel}`;
    }
};
