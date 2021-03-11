import type { Message, Client, TextChannel } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { createAuditLogChannel } from '../utils/create-audit-log-channel';

export const messageDelete = async (client: Client, message: Message) => {
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
        if (!guildConfig.auditLog.events.includes('messageDelete')) return;

        // Find the channel
        const auditLog = message.guild.channels.cache.find(channel => channel.name === (guildConfig.auditLog.channel ?? 'audit-log')) as TextChannel;

        // If we can't find the channel then create one called "audit-log"
        if (!auditLog) {
            await createAuditLogChannel(client, message);
        }

        // Get the last deleted log
        const fetchedLogs = await message.guild.fetchAuditLogs({
            limit: 1,
            type: 'MESSAGE_DELETE',
        });

        // Since we only have 1 audit log entry in this collection, we can simply grab the first one
        const deletionLog = fetchedLogs.entries.first();

        // Bail if we don't get any logs back
        if (!deletionLog) return;

        // Log for debugging
        logger.silly(`${deletionLog.executor.tag} deleted a message by ${message.author.tag}`);

        // Build description
        const item = (message.author.bot && message.embeds.length >= 1) ? `${message.embeds.length} embeds` : 'Message';
        const description = `:wastebasket: **${item} sent by** <@${message.author.id}> **deleted in** <#${message.channel.id}>\n${message.content}`;

        // Send message to audit log channel
        await auditLog.send(new MessageEmbed({
            author: {
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true, size: 64 })
            },
            description,
            footer: {
                text: `Message ID: ${message.id}`
            },
            timestamp: new Date()
        }));
    } catch (error: unknown) {
        logger.error(error as Error);
    }
};

