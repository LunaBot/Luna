import { client } from '@/client';
import { Command } from '@/command';
import { AppError } from '@/errors';
import type { Interaction, Message } from 'discord.js';

export class BotInvite extends Command {
    public name = 'Bot Invite';
    public command = 'bot-invite';
    public timeout = 1000;
    public description = 'Generate an invite for this bot';
    public hidden = false;
    public owner = false;
    public examples = [ '!bot-invite' ];

    async messageHandler(_prefix: string, _message: Message, _args: string[]) {
        return this.handler();
    }
    async interactionHandler(_prefix: string, _interaction: Interaction) {
        return this.handler();
    }

    async handler() {
        const clientId = client.user?.id;
        if (!clientId) {
            throw new AppError('no client ID found');
        }

        return `You can invite me here: https://discordapp.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=0`;
    } 
};
