
import { Message } from 'discord.js';

export default {
    name: 'clear',
    command: 'clear',
    description: 'Clear messages',
    roles: [
        'server-mod'
    ],
    async handler(message: Message, args: string[]) {
        // Amount of messages which should be deleted
        const amount = parseInt(args[0], 10);
        const channel = message.channel;

        if (!amount) return 'You haven\'t given an amount of messages which should be deleted!';
        if (isNaN(amount as unknown as number)) return 'The amount parameter isn`t a number!';

        if (amount > 100) return 'You can`t delete more than 100 messages at once!';
        if (amount < 1) return 'You have to delete at least 1 message!';

        // Don't allow clearing in DM channels
        if (channel.type === 'dm') return `You can't use the \`clear\` command in a DM channel.`;

        const messages = await message.channel.messages.fetch({ limit: amount });

        // Bulk delete all messages that've been fetched and aren't older than 14 days (due to the Discord API)
        await channel.bulkDelete(messages);

        return `deleted ${amount} messages!`;
    }
};
