import { Command } from '../command';
import type { GuildChannel, Message, TextChannel } from 'discord.js';

const isChannelText = (channel?: GuildChannel): channel is TextChannel => channel?.type === 'text';

class Announce extends Command {
    public name = 'announce';
    public command = 'announce';
    public timeout = 1000;
    public description = 'Send a message to a channel as automod';
    public hidden = false;
    public owner = false;
    public examples = [ '!announce #general Good morning @everyone <3' ];
    public roles = [ '@queen' ];
    public arguments = {
        minimum: 2,
        maximum: Infinity
    };

    async handler(_prefix: string, message: Message, args: string[]) {
        const [_channelName, ..._announcement] = args;

        // No channel provided
        if (!_channelName) {
            return `You need to provide a channel for this announcement.`;
        }

        const channelIdentifier = this.getIdFromMessage(_channelName) ?? _channelName;
        const announcement = _announcement.join(' ');
        const channel = message.guild?.channels.cache.find(({ name, id }) => [name, id].includes(channelIdentifier));

        // Invalid channel name
        if (!channel) {
            return `No channel found for ${_channelName} try tagging the channel.`;
        }

        // No message provided
        if (!announcement) {
            return 'You need to provide a message for the announcement!'
        }

        // Only send to test channels
        if (isChannelText(channel)) {
            // Send to new channel
            await channel.send(announcement);
        }

        return `Sent message to ${_channelName}`;
    } 
};

export default new Announce();