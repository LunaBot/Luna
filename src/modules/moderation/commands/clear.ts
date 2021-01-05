import { Interaction, Message, TextChannel } from 'discord.js';
import { client } from '@/client';
import { Command, ApplicationCommandOptionType } from '@/command';

export class Clear extends Command {
    public name = 'Clear';
    public command = 'clear';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Clear messages';
    public hidden = false;
    public owner = false;
    public options = [{
        name: 'amount',
        description: 'The amount of messages to remove.',
        type: ApplicationCommandOptionType.INTEGER,
        required: true
    }];
    public permissions = ['MANAGE_MESSAGES' as const];
    public examples = [ '!clear 1', '!clear 10', '!clear 25', '!clear 100' ];
    public roles = [];

    async messageHandler(_prefix: string, message: Message, args: string[]) {
        const amount = parseInt(args[0], 10);
        return this.handler(amount, message.guild?.id!, message.channel.id);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        const amount = parseInt(interaction.options?.find(({ name }: any) => name === 'amount')?.value ?? '', 10);
        return this.handler(amount, interaction.guild.id, interaction.channel.id);
    }

    /**
     * Clear handler
     * @param amount Amount of messages which should be deleted
     * @param serverId The server snowflake
     * @param channelId The channel snowflake
     */
    async handler(amount: number, serverId: string, channelId: string) {
        // Lookup the channel by id
        const channel = client.guilds.cache.get(serverId)?.channels.cache.find(channel => channel.id === channelId)! as TextChannel;

        // Validate amount
        if (!amount) return `You didn't provide a number of messages to be deleted!`;
        if (amount > 100) return `You can't delete more than 100 messages at once!`;
        if (amount < 1) return 'You have to delete at least 1 message!';

        // Get non-pinned messages
        const messages = await channel.messages.fetch({ limit: amount }).then(messages => messages.filter(message => !message.pinned));

        // Bulk delete all messages that've been fetched and aren't older than 14 days (due to the Discord API)
        const { size: messageCount } = await channel.bulkDelete(messages);

        // Return success
        return `Deleted ${messageCount} messages!`;
    }
};