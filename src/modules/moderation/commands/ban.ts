import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { isAdmin, isOwner, isMod } from '../../../utils';
import { CommandError } from '../../../errors';
import { Collection } from 'discord.js';
import { TextChannel } from 'discord.js';
import { createChannel } from '../../audit-log/utils/create-channel';
import { MessageEmbed } from 'discord.js';

class Ban implements Command {
    public name = 'ban';
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

    	// Command is owner/admin/mod only
        if (!isOwner(message.guild, message.member) && !isAdmin(message.guild, message.member) && !isMod(message.guild, message.member)) {
            throw new CommandError('You\'re not an admin, mod or the owner, sorry!');
        }

        // Get guild config
        const guildConfig = client.settings.get(message.guild.id)!

        // Create named logger with id and name
        const logger = client.logger.createChild({
            prefix: message.guild.id
        }).createChild({
            prefix: message.guild.name
        });

        // Get the user we need to ban
        const memberToBan = message.mentions.members?.first();

        // Bail if we don't have someone to ban
        if (!memberToBan) throw new CommandError('You need to mention a user to ban them!');

        // Find the channel
        const auditLog = message.guild.channels.cache.find(channel => channel.name === (guildConfig.auditLog.channel ?? 'audit-log')) as TextChannel;

        // If we can't find the channel then create one called "audit-log"
        if (!auditLog) {
            await createChannel(client, message);
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
            await memberToBan.send(new MessageEmbed({
                description: `:woman_police_officer: **You were banned from ${message.guild.name}**`,
                fields,
                timestamp: new Date()
            }))

            // Try and ban member with reason
            await memberToBan.ban({
                reason
            });


            // Log for debugging
            logger.silly(`${message.author.tag} banned ${memberToBan.user.tag || memberToBan.user.username}`);

            // Send message to audit log channel
            await auditLog.send(new MessageEmbed({
                description: `:woman_police_officer: <@${memberToBan.user?.id}> **was banned by** <@${message.member.user.id}>`,
                fields,
                timestamp: new Date()
            }));
        } catch (error: unknown) {
            await message.channel.send(`Failed banning **${memberToBan.user.tag}**: ${(error as Error).message}`);
        }
    }
}

export const ban = new Ban();