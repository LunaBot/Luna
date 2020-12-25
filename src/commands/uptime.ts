import type { Message } from 'discord.js';
import { Command } from '../command';

class Uptime extends Command {
    public name = 'uptime';
    public command = 'uptime';
    public timeout = 5000;
    public description = 'Check the bot\'s uptime.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public roles = [ '@everyone' ];

    async handler(_prefix: string, _message: Message) {
        const uptime = Math.floor(process.uptime());
        return `This bot has been up for ${uptime}ms.`;
    }
};

export default new Uptime();