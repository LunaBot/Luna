import { Message } from 'discord.js';
import { Command } from '../command';

class Clear extends Command {
    public name = 'clear';
    public command = 'clear';
    public timeout = 5000;
    public description = 'Clear messages';
    public hidden = false;
    public owner = false;
    public examples = [ '!clear 1', '!clear 10', '!clear 25', '!clear 100' ];
    public roles = [ 'server-mod' ];

    async handler(_prefix: string, message: Message, args: string[]) {
        // Amount of messages which should be deleted
        const amount = parseInt(args[0], 10);
        const channel = message.channel;

        // Validate amount
        if (!amount) return `you didn't provide a number of messages to be deleted!`;
        if (amount > 100) return `you can't delete more than 100 messages at once!`;
        if (amount < 1) return 'you have to delete at least 1 message!';

        // Don't allow clearing in DM channels
        if (channel.type === 'dm') return 'you can\'t use the `clear` command in a DM channel.';

        const messages = await message.channel.messages.fetch({ limit: amount });

        // Bulk delete all messages that've been fetched and aren't older than 14 days (due to the Discord API)
        const { size: messageCount } = await channel.bulkDelete(messages);

        return `deleted ${messageCount} messages!`;
    }
};

export default new Clear();