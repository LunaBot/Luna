import { MessageEmbed, Message } from 'discord.js';
import commands from './index';
import { getCommandHelp } from '../utils';

export default {
    name: 'commands',
    command: 'commands',
    description: 'Print all commands you have access to.',
    roles: [
        '@everyone'
    ],
    async handler(message: Message, args: string[]) {
        const commandsIcanAccess = commands.filter(command => message.member?.roles.cache.some(role => command.roles.includes(role.name)));
        const fields = commandsIcanAccess.map(command => getCommandHelp(command));

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setURL('https://discord.js.org/')
            .setAuthor('Commands')
            .addFields(fields);

        return embed;
    }
};
