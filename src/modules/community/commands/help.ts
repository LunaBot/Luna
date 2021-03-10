import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { MessageEmbed } from 'discord.js';

class Help implements Command {
    public name = 'help';

    async run(client: Client, message: Message, args: string[]) {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        // We get the value, and autoEnsure guarantees we have a value already.
		const guildConfig = client.settings.get(message.guild.id)!;

        message.channel.send(new MessageEmbed({
            title: 'Help',
            description: `Use \`${guildConfig.prefix}report\` to report any bugs.`,
            fields: client.modules.map(module => {
                return {
                    name: `**__${module.name}__**`,
                    value: `${Object.values(module.commands).map(command => '`' + guildConfig.prefix + command.name + '`').join('\n')}`
                };
            })
        }))
    }
};

export const help = new Help();