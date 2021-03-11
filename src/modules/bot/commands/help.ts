import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { MessageEmbed, Collection } from 'discord.js';
import camelcase from 'camelcase';

class Help implements Command {
    public name = 'help';
    public paramaters = new Collection<string, { type: 'string' | 'boolean' | 'number' | 'mention'; }>();

    async run(client: Client, message: Message, args: string[]) {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        // Get guild config
        const guildConfig = client.settings.get(message.guild.id)!;

        // Send help
        await message.channel.send(new MessageEmbed({
            title: 'Help',
            description: `Use \`${guildConfig.prefix}report <message>\` to report any bugs.`,
            fields: client.modules.filter(commandModule => {
                const moduleKey = camelcase(commandModule.name);
                const isEnabled = Object.keys(guildConfig).includes(moduleKey) && guildConfig[moduleKey].enabled;
                const hasCommands = Object.keys(commandModule.commands).length >= 1;
                return isEnabled && hasCommands;
            }).map(commandModule => {
                return {
                    name: `**__${commandModule.name}__**`,
                    value: `${Object.values(commandModule.commands).map(command => {
                        const paramaters = (!command.paramaters || command.paramaters.size === 0) ? '' : (' ' + [...command.paramaters.entries()].map(([key, parameter]) => {
                            const brackets = parameter.optional ? '[]' : '<>';
                            return `${brackets[0]}${parameter.type === 'mention' ? '@' : ''}${key}${brackets[1]}`;
                        }).join(' '));
                        return '`' + guildConfig.prefix + command.name + paramaters + '`';
                    }).join('\n')}`
                };
            })
        }))
    }
};

export const help = new Help();