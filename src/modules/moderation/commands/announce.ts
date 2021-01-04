import { ApplicationCommandOptionType, Command } from '@/command';
import type { Channel, Interaction, Message } from 'discord.js';
import { AppError } from '@/errors';
import { isTextChannel } from '@/guards';

export class Announce extends Command {
    public name = 'Announce';
    public command = 'announce';
    public timeout = 1000;
    public description = 'Send a message to a channel as automod';
    public hidden = false;
    public owner = false;
    public examples = [ '!announce #general Good morning @everyone <3' ];
    public options = [{
        name: 'channel',
        description: 'Where to post the message',
        type: ApplicationCommandOptionType.CHANNEL
    }, {
        name: 'announcement',
        description: 'The message to post',
        type: ApplicationCommandOptionType.STRING
    }];

    async messageHandler(_prefix: string, message: Message, args: string[]) {
        const channel = message.mentions.channels.first()!;
        const announcement = args.slice(1).join(' ');
        return this.handler(channel, announcement);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        const channelId = interaction.options?.find(option => option.name === 'channel')?.value!;
        const channel = interaction.guild.channels.cache.get(channelId)!;
        const announcement = interaction.options?.find(option => option.name === 'announcement')?.value!;
        return this.handler(channel, announcement);
    }

    async handler(channel: Channel, announcement: string) {
        // No channel provided
        if (!channel) {
            return `You need to provide a channel for this announcement.`;
        }

        // No message provided
        if (!announcement) {
            return 'You need to provide a message for the announcement!'
        }

        // Only send to text channels
        if (!isTextChannel(channel)) {
            throw new AppError('Invalid channel type!');
        }

        // Send to new channel
        await channel.send(announcement);

        return `Sent message to <#${channel.id}>`;
    }
};
