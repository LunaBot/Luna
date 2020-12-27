import humanizeDuration from 'humanize-duration';
import type { Message } from 'discord.js';
import { Command } from '../command';
import { envs } from '../envs';

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
        return `Hi I'm ${envs.BOT.COMMIT_HASH} and I've been alive for ${uptime}.`;
    }
};

export default new Uptime();