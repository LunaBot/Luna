import type { Message, Client, TextChannel } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { createChannel } from '../utils/create-channel';

export const messageUpdate = async (client: Client, message: Message, newMessage: Message) => {
    // This stops if it's not a guild, and we ignore all bots.
    // @todo: add the ability for servers to track specific bots or all bot message deletions
    if (!message.guild || message.author.bot) return;

    // Create named logger with id and name
    const logger = client.logger.createChild({
        prefix: message.guild.id
    }).createChild({
        prefix: message.guild.name
    });

    try {
        // Get guild config
        const guildConfig = client.settings.get(message.guild.id)!;

        // Bail if the module is disabled
        if (!guildConfig.auditLog.enabled) return;

        // Bail if this event is disabled
        if (!guildConfig.auditLog.events.includes('messageUpdate')) return;

        // Find the channel
        const auditLog = message.guild.channels.cache.find(channel => channel.name === (guildConfig.auditLog.channel ?? 'audit-log')) as TextChannel;

        // If we can't find the channel then create one called "audit-log"
        if (!auditLog) {
            await createChannel(client, message);
        }

        // Log for debugging
        logger.silly(`Message by ${message.author.tag} updated from ${message.content.length} characters to ${newMessage.content.length}`);

        // Send message to audit log channel
        await auditLog.send(new MessageEmbed({
            author: {
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true, size: 64 })
            },
            description: `:pencil: **Message sent by** <@${message.author.id}> **edited in** <#${message.channel.id}>`,
            footer: {
                text: `Message ID: ${message.id}`
            },
            fields: [{
                name: 'Old message',
                value: message.content
            }, {
                name: 'New message',
                value: newMessage.content
            }],
            timestamp: new Date()
        }));
    } catch (error: unknown) {
        logger.error(error as Error);
    }
};

