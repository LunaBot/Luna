import { Message } from 'discord.js';

export default {
    name: 'bot',
    command: 'bot',
    timeout: 5000,
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
        setTimeout(() => {
            process.exit(0);
        }, 500);

        return 'restarting bot, please wait...';
    }
};
