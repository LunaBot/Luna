import { Command } from '../command';
import type { Message } from 'discord.js';

class Ping extends Command {
    public name = 'ping';
    public command = 'ping';
    public timeout = 5000;
    public description = 'Check the bot\'s latency.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public roles = [ '@everyone' ];

    async handler(_prefix: string, message: Message) {
        const timeTaken = Date.now() - message.createdTimestamp;
        return `Pong! This message had a latency of ${timeTaken}ms.`;
    }
};

export default new Ping();