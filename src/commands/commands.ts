import { MessageEmbed, Message } from 'discord.js';
import commands from './index';
import { getCommandHelp } from '../utils';
import { Command } from '../command';

class Commands extends Command {
    public name = 'commands';
    public command = 'commands';
    public timeout = 5000;
    public description = 'Print all commands you have access to.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public roles = [ '@everyone' ];

    async handler(_prefix: string, message: Message, _args: string[]) {
        const _commandsUserCanAccess = (commands as Command[]).filter(command => message.member?.roles.cache.some(role => command.roles.includes(role.name)));
        const commandsUserCanAccess = _commandsUserCanAccess.filter(command => !command.hidden);
        const fields = commandsUserCanAccess.map(command => getCommandHelp(command));

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setURL('https://discord.js.org/')
            .setAuthor('Commands')
            .addFields(fields);

        return embed;
    }
};

export default new Commands();