import type { Message } from 'discord.js';
import { client } from '../client';
import { AppError } from '../errors';
import { Command } from '../command';

class Bot extends Command {
    public name =  'bot';
    public command =  'bot';
    public timeout =  5000;
    public description =  'Internal bot commands';
    public hidden =  true;
    public owner =  true;
    public examples =  [ '!bot log-level', '!bot log-level info', '!bot log-level debug', '!bot log-level trace'];
    public roles =  [];

    async handler(_prefix: string, _message: Message, _args: string[]) {
        const clientId = client.user?.id;
        if (!clientId) {
            throw new AppError('no client ID found');
        }

        return `you can invite me here: https://discordapp.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=0`;
    } 
};

export default new Bot();