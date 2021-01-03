import git from 'git-rev-sync';
import humanizeDuration from 'humanize-duration';
import { Command } from '@/command';
import { envs } from '@/envs';
import type { Interaction, Message } from 'discord.js';

export class Uptime extends Command {
    public name = 'Uptime';
    public command = 'uptime';
    public timeout = 5000;
    public description = 'Check the bot\'s uptime.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public roles = [ '@everyone' ];

    async messageHandler(_prefix: string, _message: Message) {
        return this.handler();
    }

    async interactionHandler(_prefix: string, _interaction: Interaction) {
        return this.handler();
    }

    async handler() {
        const uptime = humanizeDuration(Math.floor(process.uptime()) * 1000);
        return `Hi I'm \`${envs.BOT.COMMIT_HASH || git.short()}\` and I've been alive for ${uptime}.`;
    }
};