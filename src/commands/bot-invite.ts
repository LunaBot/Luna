import { Message } from 'discord.js';
import { client } from '../client';
import { AppError } from '../errors';
import { Command } from '../command';

class BotInvite extends Command {
    public name = 'bot-invite';
    public command = 'bot-invite';
    public timeout = 1000;
    public description = 'Generate an invite for this bot';
    public hidden = false;
    public owner = false;
    public examples = [ '!bot-invite' ];
    public roles = [ '@everyone' ];

    async handler(_prefix: string, _message: Message, _args: string[]) {
        const clientId = client.user?.id;
        if (!clientId) {
            throw new AppError('no client ID found');
        }

        return `you can invite me here: https://discordapp.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=0`;
    } 
};

export default new BotInvite();