import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { MessageEmbed, Collection } from 'discord.js';
import camelcase from 'camelcase';
import { report } from './report';

class Help implements Command {
    public name = 'help';
    public paramaters = new Collection<string, { type: 'string' | 'boolean' | 'number' | 'mention'; }>();

    getHelpText() {
        return 'Get help text.';
    }

    async run(client: Client, message: Message, args: string[]) {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        // Get guild config
        const guildConfig = client.settings.get(message.guild.id)!;

        // Get command
        const commandName = args[0];

        // Get all valid modules
        // This removed modules which are disabled, internal or have no commands
        const validModules = client.modules.filter(commandModule => {
            const moduleKey = camelcase(commandModule.name);
            const isEnabled = Object.keys(guildConfig).includes(moduleKey) && guildConfig[moduleKey].enabled;
            const hasCommands = Object.keys(commandModule.commands).length >= 1;
            const isInternal = (commandModule as any).internal ?? false;
            return isEnabled && hasCommands && !isInternal;
        });

        // Build help sections
        const helpSections = validModules.map(commandModule => {
            return {
                name: `**__${commandModule.name}__**`,
                value: `${Object.values(commandModule.commands).map(command => {
                    const paramaters = (!command.paramaters || command.paramaters.size === 0) ? '' : (' ' + [...command.paramaters.entries()].map(([key, parameter]) => {
                        const brackets = parameter.optional ? '[]' : '<>';
                        return `${brackets[0]}${parameter.type === 'mention' ? '@' : ''}${key}${brackets[1]}`;
                    }).join(' '));
                    return '`' + guildConfig.prefix + command.name + paramaters + '`';
                }).join('\n')}\n\n`
            };
        });

        // Add footer onto the last help section
        helpSections[helpSections.length - 1].value += `Use \`${guildConfig.prefix}${report.name} <message>\` to report any bugs.`

        // Send general help
        if (!commandName) {
            await message.channel.send(new MessageEmbed({
                title: 'Help',
                fields: helpSections
            }));
        }

        // Get command
        const command = client.commands.get(commandName);

        // Bail if the command name is invalid
        if (!command) return;

        // Build command params
        const paramaters = (!command.paramaters || command.paramaters.size === 0) ? '' : (' ' + [...command.paramaters.entries()].map(([key, parameter]) => {
            const brackets = parameter.optional ? '[]' : '<>';
            return `${brackets[0]}${parameter.type === 'mention' ? '@' : ''}${key}${brackets[1]}`;
        }).join(' '));

        // Get command's module
        const commandModule = client.modules.find(commandModule => {
            const found = Object.values(commandModule.commands).find(command => command.name === commandName);
            return Boolean(found);
        });

        // Bail if command module can't be found
        if (!commandModule) return;

        // Guild help text
        const getHelpText = () => command.getHelpText ? command.getHelpText(client, message) : false;
        const description = getHelpText() || `No help text available, please report this with the \`${guildConfig.prefix}${report.name}\` command.`;

        // Send command help
        await message.channel.send(new MessageEmbed({
            title: `Help`,
            fields: [{
                name: `**__command__**`,
                value: '`' + guildConfig.prefix + command.name + paramaters + '`'
            }, {
                name: `**__description__**`,
                value: description + '\n\n' + `Use \`${guildConfig.prefix}${report.name} <message>\` to report any bugs.`
            }]
        }))

    }
};

export const help = new Help();