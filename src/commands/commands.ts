import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../command';
import { AppError } from '../errors';
import { isTextChannelMessage } from '../guards';
import { Server } from '../servers';
import { getCommandHelp } from '../utils';
import commands from './index';

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
        if (isTextChannelMessage(message)) {
            const server = await Server.findOrCreate({ id: message.guild.id });
            const _commandsUserCanAccess = (commands as Command[]).filter(command => message.member?.roles.cache.some(role => command.roles.includes(role.name)));
            const commandsUserCanAccess = _commandsUserCanAccess.filter(command => !command.hidden);
            const fields = commandsUserCanAccess.map(command => getCommandHelp(server.prefix || '!', command));
    
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setURL('https://discord.js.org/')
                .setAuthor('Commands')
                .addFields(fields);
    
            return embed;
        }

        throw new AppError('Invalid channel type');
    }
};

export default new Commands();