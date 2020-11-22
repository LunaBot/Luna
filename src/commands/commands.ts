import { MessageEmbed, Message } from 'discord.js';
import commands from './index';
import { getCommandHelp } from '../utils';
import type { Command } from '../types';

export default {
    name: 'commands',
    command: 'commands',
    timeout: 5000,
    description: 'Print all commands you have access to.',
    hidden: false,
    owner: false,
    examples: [],
    roles: [
        '@everyone'
    ],
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
