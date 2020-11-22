import { Message, MessageEmbed } from 'discord.js';
import commands from './index';
import { getCommandHelp } from '../utils';
import type { Command } from '../types';
import { InvalidCommandError } from '../errors';

export default {
    name: 'Command help',
    command: 'command-help',
    timeout: 5000,
    description: 'Show command help.',
    hidden: false,
    owner: false,
    examples: [
        '!command_help',
        '!command_help help',
        '!command_help commands',
        '!command_help command_help',
        '!command_help kick'
    ],
    roles: [
        '@everyone'
    ],
    async handler(prefix: string, _message: Message, args: string[]) {
        const commandName = args[0]; // help

        // Print out the command's help
        const command = (commands as Command[]).find(_command => _command.name === commandName);
        if (!command) {
            throw new InvalidCommandError(prefix, 'command', args);
        }
        return new MessageEmbed()
            .setColor('#0099ff')
            .setURL('https://discord.js.org/')
            .setAuthor(commandName)
            .addFields(getCommandHelp(command, prefix));
    }
};
