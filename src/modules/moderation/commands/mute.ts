import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { isAdmin, isOwner } from '../../../utils';
import { CommandError } from '../../../errors';
import { Collection } from 'discord.js';
import { createMutedRole } from '../utils/create-role';
import { Role } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { createAuditLogChannel } from '../../audit-log/utils/create-audit-log-channel';

class Mute implements Command {
    public name = 'mute';
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
        const memberToMute = message.mentions.members?.first();

        // Bail if we don't have someone to mute
        if (!memberToMute) throw new CommandError('You need to mention a user to mute them!');

        // Find the role
        let muteRole = message.guild.roles.cache.find(role => role.name === (guildConfig.roles.muted ?? 'muted')) as Role;

        // If we can't find the role then create one called "muted"
        if (!muteRole) {
            await createMutedRole(client, message);
        }

        // Find the role now that it's been created
        muteRole = message.guild.roles.cache.find(role => role.name === (guildConfig.roles.muted ?? 'muted')) as Role;

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

        try {
            // DM user
            await memberToMute.send(new MessageEmbed({
                description: `:woman_police_officer: **You were muted in ${message.guild.name}**`,
                fields,
                timestamp: new Date()
            }))

            // Give the member the mute role
            await memberToMute.roles.add(muteRole);

            // Log for debugging
            logger.silly(`${message.author.tag} muted ${memberToMute.user.tag || memberToMute.user.username}`);

            // Don't send audi-log message since the module is disabled
            if (!guildConfig.auditLog.enabled) return;

            // Send message to audit log channel
            await auditLog.send(new MessageEmbed({
                description: `:woman_police_officer: <@${memberToMute.user?.id}> **was muted by** <@${message.member.user.id}>`,
                fields,
                timestamp: new Date()
            }));
        } catch (error: unknown) {
            await message.channel.send(`Failed muting **${memberToMute.user.tag}**: ${(error as Error).message}`);
        }
    }
}

export const mute = new Mute();