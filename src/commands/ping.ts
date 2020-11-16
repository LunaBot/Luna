import { Message } from 'discord.js';

export default {
    name: 'ping',
    command: 'ping',
    description: 'Check the bot\'s latency.',
    roles: [
        '@everyone'
    ],
    async handler(message: Message) {
        const timeTaken = Date.now() - message.createdTimestamp;
        return `Pong! This message had a latency of ${timeTaken}ms.`;
    }
};