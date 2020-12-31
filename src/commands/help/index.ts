import dedent from 'dedent';
import { Message, MessageEmbed } from 'discord.js';
import { Command } from '../../command';
import { InvalidCommandError } from '../../errors';
import commands from '../index';
import { menu as generateHelp } from './generators';

class Help extends Command {
    public name = 'Help';
    public command = 'help';
    public timeout = 5000;
    public description = 'Show help';
    public hidden = false;
    public owner = false;
    public examples = [];
    public roles = [ '@everyone' ];

    private getCommandSummary(prefix: string, command: Command) {
        return [{
            name: 'Name',
            value: command.name,
        }, {
            name: 'Command',
            value: `\`${prefix}${command.command}\``
        }, {
            name: 'Description',
            value: command.description
        }];
    }

    private getCommandExamples(prefix: string, command: Command) {
        return {
            name: 'Examples',
            value: '```\n' + command.examples.map(example => `${prefix}${example.substring(1)}`).join('\n') + '\n```'
        };
    }

    async handler(prefix: string, _message: Message, args: string[]) {
        const commandName = args[0]; // verification
        if (!commandName) {
            return generateHelp(prefix);
        }

        const command = (commands as Command[]).find(_command => _command.command === commandName);
        if (!command) {
            throw new InvalidCommandError(prefix, commandName, args);
        }

        // Create the embed
        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .addFields(this.getCommandSummary(prefix, command))

        // If we have examples show them
        if (command.examples.length >= 1) {
            embed.addFields(this.getCommandExamples(prefix, command));
        }

        return embed;
    }
};

export default new Help();
