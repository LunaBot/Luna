import { Interaction, Message, MessageEmbed } from 'discord.js';
import joinUrl from 'url-join';
import { ApplicationCommandOptionType, Command } from '@/command';
import { config } from '@/config';
import { InvalidCommandError } from '@/errors';
import { moduleManager } from '@/module-manager';

const generateHelp = (prefix: string) => {
    return new MessageEmbed()
        .setColor('#0099ff')
        .setURL(joinUrl(config.PUBLIC_URL, 'wiki', 'help'))
        .setAuthor('Help')
        .addFields({
            name: 'What commands can I use?',
            value: `\`${prefix}commands\``
        }, {
            name: 'How do I invite the bot?',
            value: `\`${prefix}bot invite\``
        });
};

export class Help extends Command {
    public name = 'Help';
    public command = 'help';
    public timeout = 5000;
    public description = 'Show help';
    public hidden = false;
    public owner = false;
    public examples = [];
    public roles = [ '@everyone' ];
    public options = [{
        name: 'command',
        required: false,
        type: ApplicationCommandOptionType.STRING,
        description: 'The command to lookup help for.'
    }]

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

    async messageHandler(prefix: string, _message: Message, args: string[]) {
        const commandName = args[0];
        return this.handler(prefix, commandName);
    }
    async interactionHandler(prefix: string, interaction: Interaction) {
        const commandName = interaction.options?.find(option => option.name === 'command')?.value!;
        return this.handler(prefix, commandName);
    }

    async handler(prefix: string, commandName?: string) {
        if (!commandName) {
            return generateHelp(prefix);
        }

        const commands = moduleManager.getCommands();
        const command = commands.find(_command => _command.command === commandName);
        if (!command) {
            throw new InvalidCommandError(prefix, commandName, []);
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

