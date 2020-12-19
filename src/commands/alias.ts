import { Message } from 'discord.js';
import { Command } from '../command';

class Alias extends Command {
    public name = 'alias';
    public command = 'alias';
    public timeout = 3000;
    public description = 'Manages command aliases';
    public hidden = true;
    public owner = true;
    public examples = [ '!alias' ];
    public roles = [];

    async handler(_prefix: string, _message: Message, args: string[]) {
        const [ subCommand, alias, ...command ] = args;
        // !alias create cat
        if (args[0] === 'create') {
            const alias = args[1];
            return `Alias created for ${alias} pointing to ${command}`;
        }
    } 
};

export default new Alias();