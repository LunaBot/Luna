import type { Client, Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';

export const message = async (client: Client, message: Message) => {
    // This stops if it's not a guild, and we ignore all bots.
    if (!message.guild || message.author.bot || !message.member) {
        return;
    }

    // Get guild config
    const guildConfig = client.settings.get(message.guild.id)!

    // Bail if it's a command;
    if (message.content.indexOf(guildConfig.prefix) === 0) return;

    // Bail if walk-talkie is disabled
    if (!guildConfig.walkieTalkie.enabled) return;

    // Bail if this is the wrong channel
    if (guildConfig.walkieTalkie.channel !== message.channel.id) return;

    // Bail if the content is less than 2 chars
    if (message.content.length <= 2) return;

    // Send message to others in network
    client.logger.info('Forwarding to network: %s', message.content);
    await Promise.all([...client.walkieTalkies.entries()].map(async ([guildId, { id, token }]) => {
        // Don't send the message to the guild where it was sent from
        if (guildId === message.guild?.id) return;

        // Get webhook
        const webhook = await client.fetchWebhook(id, token);

        // Update current user
        await webhook.edit({
            name: message.author.username,
            avatar: message.author.displayAvatarURL()
        });

        // Send message
        await webhook.send(message.content);
    }));
};
