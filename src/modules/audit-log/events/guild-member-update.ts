import type { Message, Client, TextChannel } from 'discord.js';
import { GuildMember } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { createChannel } from '../utils/create-channel';

export const guildMemberUpdate = async (client: Client, member: GuildMember, newMember: GuildMember) => {
    // This stops if it's not a guild, and we ignore all bots.
    // @todo: add the ability for servers to track specific bots or all bot message deletions
    if (!member.guild || member.user.bot) return;

    // Create named logger with id and name
    const logger = client.logger.createChild({
        prefix: member.guild.id
    }).createChild({
        prefix: member.guild.name
    });

    try {
        // Get guild config
        const guildConfig = client.settings.get(member.guild.id)!;

        // Bail if the module is disabled
        if (!guildConfig.auditLog.enabled) return;

        // Bail if this event is disabled
        if (!guildConfig.auditLog.events.includes('guildMemberUpdate')) return;

        // Find the channel
        const auditLog = member.guild.channels.cache.find(channel => channel.name === (guildConfig.auditLog.channel ?? 'audit-log')) as TextChannel;

        // If we can't find the channel then create one called "audit-log"
        if (!auditLog) {
            await createChannel(client, member);
        }

        // Log for debugging
        logger.silly(`${member.user.tag} updated their ...`);

        // // Build description
        // const item = (message.author.bot && message.embeds.length >= 1) ? `${message.embeds.length} embeds` : 'Message';
        // const description = `:pencil: **Message sent by** <@${message.author.id}> **edited** in <#${message.channel.id}>`;

        // // Send message to audit log channel
        // await auditLog.send(new MessageEmbed({
        //     author: {
        //         name: message.author.username,
        //         iconURL: message.author.displayAvatarURL({ dynamic: true, size: 64 })
        //     },
        //     description,
        //     footer: {
        //         text: `Message ID: ${message.id}`
        //     },
        //     fields: [{
        //         name: 'Old message',
        //         value: message.content
        //     }, {
        //         name: 'New message',
        //         value: newMessage.content
        //     }],
        //     timestamp: new Date()
        // }));
    } catch (error: unknown) {
        logger.error(error as Error);
    }
};

