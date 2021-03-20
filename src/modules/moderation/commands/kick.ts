import { Command } from '@lunabot/kaspar';
import type { Message, Client } from 'discord.js';
import { isAdmin, isOwner } from '../../../utils';
import { CommandError } from '../../../errors';
import { Collection } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { createAuditLogChannel } from '../../audit-log/utils/create-audit-log-channel';
import { TextChannel } from 'discord.js';

class Kick implements Command {
    public name = 'kick';
    public paramaters = new Collection(Object.entries({
        user: {
            type: 'mention' as const
        },
        reason: {
            type: 'string' as const
        }
    }));

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

    	// Command is owner/admin only
        if (!isOwner(message.guild, message.member) && !isAdmin(message.guild, message.member)) {
            throw new CommandError('You\'re not an admin or the owner, sorry!');
        }

        // Get guild config
        const guildConfig = client.settings.get(message.guild.id)!

        // Create named logger with id and name
        const logger = client.logger.createChild({
            prefix: message.guild.id
        }).createChild({
            prefix: message.guild.name
        });

        // Get the user we need to kick
        const memberToKick = message.mentions.members?.first();

        // Bail if we don't have someone to kick
        if (!memberToKick) throw new CommandError('You need to mention a user to kick them!');

        // Find the channel
        const auditLog = message.guild.channels.cache.find(channel => channel.name === (guildConfig.auditLog.channel ?? 'audit-log')) as TextChannel;

        // If we can't find the channel then create one called "audit-log"
        if (!auditLog) {
            await createAuditLogChannel(client, message);
        }

        // If there's something other than just a mention let's use it as a reason
        const reason = args.length >= 2 ? args.slice(1).join(' ') : '';

        // Build fields
        const fields: { name: string; value: string; }[] = [];
        if (reason) {
            fields.push({
                name: 'Reason',
                value: reason
            });
        }


        // DM user
        try {
            await memberToKick.send(new MessageEmbed({
                description: `:woman_police_officer: **You were kicked from ${message.guild.name}**`,
                fields,
                timestamp: new Date()
            }));
        } catch (error: unknown) {}

        // Send message to audit log channel if auditLog module is enabled
        if (guildConfig.auditLog.enabled) {
            try {
                await auditLog.send(new MessageEmbed({
                    description: `:woman_police_officer: <@${memberToKick.user?.id}> **was kicked by** <@${message.member.user.id}>`,
                    fields,
                    timestamp: new Date()
                }));
            } catch (error: unknown) {
                // If this fails then disable the audit-log
                guildConfig.auditLog.enabled = false;
            }
        }

        try {
            // Try and kick member with reason
            await memberToKick.kick(reason);

            // Log for debugging
            logger.silly(`${message.author.tag} kicked ${memberToKick.user.tag ?? memberToKick.user.username}`);

            // Let user know it was successful
            await message.channel.send(new MessageEmbed({
                description: `:woman_police_officer: <@${memberToKick.user?.id}> **was kicked by** <@${message.member.user.id}>`,
                fields,
                timestamp: new Date()
            }));
        } catch (error: unknown) {
            await message.channel.send(`Failed kicking **${memberToKick.user.tag}**: ${(error as Error).message}`);
        }
    }
}

export const kick = new Kick();