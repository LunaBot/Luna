import { Message } from 'discord.js';

export default {
    name: 'ping',
    command: 'ping',
    description: 'Check the bot\'s latency.',
    hidden: false,
    owner: false,
    examples: [],
    roles: [
        '@everyone'
    ],
    async handler(_prefix: string, message: Message) {
        const timeTaken = Date.now() - message.createdTimestamp;
        return `pong! This message had a latency of ${timeTaken}ms.`;
    }
};