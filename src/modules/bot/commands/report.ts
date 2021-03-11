import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { Collection } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { CommandError } from '../../../errors';

class Report implements Command {
    public name = 'report';
    public paramaters = new Collection(Object.entries({
        message: {
            type: 'string' as const
        }
    }));

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        // Get guild config
        const guildConfig = client.settings.get(message.guild.id)!;

        // Report can only be 1000 characters
        const charactersLength = (message.content.length - guildConfig.prefix.length - 7);
		if (charactersLength >= 1000) {
			throw new CommandError(`Your report is ${charactersLength - 1000} characters too long, please try again.`);
		}

        // Relay report to the bot's owner
        // @todo: move the bot owner's id to a dynamic location instead of hardcoding it
        const dmChannel = message.guild.members.cache.get('107834314439294976');
        await dmChannel?.send(new MessageEmbed({
            author: {
                name: message.author.username,
                iconURL: message.author.displayAvatarURL(),
            },
            fields: [{
                name: 'Report',
                value: message.content.substring(guildConfig.prefix.length + 7)
            }]
        }));

        await message.reply('Report sent!');
	}
};

export const report = new Report();