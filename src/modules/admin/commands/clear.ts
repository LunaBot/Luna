import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { isAdmin, isOwner, sleep } from '../../../utils';
import { CommandError } from '../../../errors';
import { TextChannel } from 'discord.js';
import { Collection } from 'discord.js';

class Clear implements Command {
    public name = 'clear';
    public paramaters = new Collection(Object.entries({
        amount: {
            type: 'number' as const
        }
    }));

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

    	// Command is owner/admin only
        if (!isOwner(message.guild, message.member) && !isAdmin(message.guild, message.member)) {
            throw new CommandError('You\'re not an admin or the owner, sorry!');
        }

        // Get amount of message to clear
        const amount = parseInt([...args][0]);

        // Validate amount
        if (!amount) throw new CommandError(`You didn't provide a number of messages to be deleted!`);
        if (amount > 100) throw new CommandError(`You can't delete more than 100 messages at once!`);
        if (amount < 1) throw new CommandError('You have to delete at least 1 message!');

        // Get non-pinned messages
        const messages = await message.channel.messages.fetch({ limit: amount + 1 }).then(messages => messages.filter(message => !message.pinned));

        // Bulk delete all messages that've been fetched and aren't older than 14 days (due to the Discord API)
        const { size } = await (message.channel as TextChannel).bulkDelete(messages);
        const messageCount = size - 1;

		// Let the user know all is good.
		const reply = await message.channel.send(`Deleted ${messageCount} message${messageCount === 1 ? '' : 's'}!`);

        // Wait 3s
        await sleep(3000);

        // Remove message
        await reply.delete();
	}
};

export const clear = new Clear();