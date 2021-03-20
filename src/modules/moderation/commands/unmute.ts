import { Command } from '@lunabot/kaspar';
import type { Message, Client } from 'discord.js';
import { isAdmin, isOwner } from '../../../utils';
import { CommandError } from '../../../errors';
import { Collection } from 'discord.js';
import { Role } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { createAuditLogChannel } from '../../audit-log/utils/create-audit-log-channel';
import { TextChannel } from 'discord.js';

class Unmute extends Command {
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

        // Get the user we need to mute
        const memberToUnmute = message.mentions.members?.first();

        // Bail if we don't have someone to unmute
        if (!memberToUnmute) throw new CommandError('You need to mention a user to unmute them!');

        // Find the role
        let muteRole = message.guild.roles.cache.find(role => role.name === (guildConfig.roles.muted ?? 'muted')) as Role;

        // If we can't find the role then bail
        if (!muteRole) throw new CommandError('No mute role found');

        // Find the channel
        const auditLog = message.guild.channels.cache.find(channel => channel.name === (guildConfig.auditLog.channel ?? 'audit-log')) as TextChannel;

        // If we can't find the channel then create one called "audit-log"
        if (!auditLog) {
            await createAuditLogChannel(client, message);
        }

        try {
            // DM user
            await memberToUnmute.send(new MessageEmbed({
                description: `:woman_police_officer: **You were unmuted in ${message.guild.name}**`,
                timestamp: new Date()
            }))

            // Remove the mute role from the member
            await memberToUnmute.roles.remove(muteRole);

            // Log for debugging
            logger.silly(`${message.author.tag} unmuted ${memberToUnmute.user.tag || memberToUnmute.user.username}`);

            // Don't send audi-log message since the module is disabled
            if (!guildConfig.auditLog.enabled) return;

            // Send message to audit log channel
            await auditLog.send(new MessageEmbed({
                description: `:woman_police_officer: <@${memberToUnmute.user?.id}> **was unmuted by** <@${message.member.user.id}>`,
                timestamp: new Date()
            }));
        } catch (error: unknown) {
            await message.channel.send(`Failed unmuting **${memberToUnmute.user.tag}**: ${(error as Error).message}`);
        }
    }
}

export const unmute = new Unmute();