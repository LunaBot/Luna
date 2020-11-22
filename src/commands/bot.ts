import { Message } from 'discord.js';
import { AppError } from '../errors';

export default {
    name: 'bot',
    command: 'bot',
    description: 'Internal bot commands',
    hidden: true,
    owner: true,
    examples: [
        '!bot log-level',
        '!bot log-level info',
        '!bot log-level debug',
        '!bot log-level trace',
    ],
    roles: [],
    async handler(_prefix: string, _message: Message, _args: string[]) {
        throw new AppError('test!');
    }
};
