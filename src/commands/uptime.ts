import humanizeDuration from 'humanize-duration';
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
        const uptime = humanizeDuration(Math.floor(process.uptime()) * 1000);
        return `This bot has been up for ${uptime}s.`;
    }
};

export default new Uptime();