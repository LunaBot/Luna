import { Message } from 'discord.js';
import { Command } from '@/command';

export class Alias extends Command {
    public name = 'Alias';
    public command = 'alias';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Manages command aliases';
    public hidden = true;
    public owner = true;
    public broken = true;
    public examples = [ '!alias' ];
    public roles = [];

    async handler(_prefix: string, _message: Message, args: string[]) {
        const [ subCommand, alias, ...command ] = args;
        // !alias create cat
        if (subCommand === 'create') {
            return `Alias created for ${alias} pointing to ${command}`;
        }
    } 
};
