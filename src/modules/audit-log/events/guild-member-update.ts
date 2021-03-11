import type { Client, TextChannel } from 'discord.js';
import { Role } from 'discord.js';
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

        // Member passed membership screening
        if (member.pending && !newMember.pending) {
            // Log for debugging
            logger.silly(`${member.user.tag} passed membership screening.`);

            // Send message to audit log channel
            await auditLog.send(new MessageEmbed({
                author: {
                    name: `${member.user.username}${member.user.discriminator}`,
                    iconURL: member.user.displayAvatarURL({ dynamic: true, size: 64 })
                },
                thumbnail: {
                    url: member.user.displayAvatarURL({ dynamic: true, size: 128 })
                },
                description: `:white_check_mark: <@${member.user.id}> **passed membership screening**`,
                timestamp: new Date()
            }));
        }

        // Nickname changed
        if (member.nickname !== newMember.nickname) {
            // Log for debugging
            logger.silly(`${member.user.tag} changed their nickname from ${member.nickname} to ${newMember.nickname}.`);

            // Send message to audit log channel
            await auditLog.send(new MessageEmbed({
                author: {
                    name: `${member.user.username}${member.user.discriminator}`,
                    iconURL: member.user.displayAvatarURL({ dynamic: true, size: 64 })
                },
                thumbnail: {
                    url: member.user.displayAvatarURL({ dynamic: true, size: 128 })
                },
                description: `:pencil: ${member.user.username} **nickname edited**`,
                fields: [{
                    name: 'Old nickname',
                    value: member.nickname
                }, {
                    name: 'New nickname',
                    value: newMember.nickname
                }],
                timestamp: new Date()
            }));
        }

        // Username changed
        if (member.user.username !== newMember.user.username) {
            // Log for debugging
            logger.silly(`${member.user.tag} changed their username from ${member.user.username} to ${newMember.user.username}.`);

            // Send message to audit log channel
            await auditLog.send(new MessageEmbed({
                author: {
                    name: `${member.user.username}${member.user.discriminator}`,
                    iconURL: member.user.displayAvatarURL({ dynamic: true, size: 64 })
                },
                thumbnail: {
                    url: member.user.displayAvatarURL({ dynamic: true, size: 128 })
                },
                description: `:pencil: ${member.user.username} **username edited**`,
                fields: [{
                    name: 'Old username',
                    value: member.user.username
                }, {
                    name: 'New username',
                    value: newMember.user.username
                }],
                timestamp: new Date()
            }));
        }

        // Avatar changed
        if (member.user.avatarURL() !== newMember.user.avatarURL()) {
            // Log for debugging
            logger.silly(`${member.user.tag} changed their avatar from ${member.user.avatarURL()} to ${newMember.user.avatarURL()}.`);

            // Send message to audit log channel
            await auditLog.send(new MessageEmbed({
                author: {
                    name: `${member.user.username}${member.user.discriminator}`,
                    iconURL: member.user.displayAvatarURL({ dynamic: true, size: 64 })
                },
                thumbnail: {
                    url: member.user.displayAvatarURL({ dynamic: true, size: 128 })
                },
                description: `:pencil: ${member.user.username} **avatar edited**`,
                fields: [{
                    name: 'Avatar',
                    value: `[before](${member.user.avatarURL()}) -> [after](${newMember.user.avatarURL()})`
                }],
                timestamp: new Date()
            }));
        }

        const removedRoles: Role[] = [];
        const addedRoles: Role[] = [];
        member.roles.cache.forEach(value => {
            if (newMember.roles.cache.find(role => role.id === value.id) == null) {
                removedRoles.push(value);
            }
        });
        newMember.roles.cache.forEach(value => {
            if (member.roles.cache.find(role => role.id === value.id) == null) {
                addedRoles.push(value);
            }
        });

        // Roles were removed or added
        if (removedRoles.length >= 1 || addedRoles.length >= 1) {
            const fields: { name: string, value: string }[] = [];
            if (removedRoles.length >= 1) {
                // Log for debugging
                logger.silly(`Role${removedRoles.length === 1 ? '' : 's'} ${removedRoles} removed from ${member.user.tag}.`);

                // Add to response
                fields.push({
                    name: 'Removed roles',
                    value: removedRoles.map(role => `<@&${role.id}>`).join(' ') ?? '​'
                });
            }
            if (addedRoles.length >= 1) {
                // Log for debugging
                logger.silly(`Role${removedRoles.length === 1 ? '' : 's'} ${addedRoles} added to ${member.user.tag}.`);

                // Add to response
                fields.push({
                    name: 'New roles',
                    value: addedRoles.map(role => `<@&${role.id}>`).join(' ') ?? '​'
                })
            }

            // Send message to audit log channel
            await auditLog.send(new MessageEmbed({
                author: {
                    name: `${member.user.username}${member.user.discriminator}`,
                    iconURL: member.user.displayAvatarURL({ dynamic: true, size: 64 })
                },
                thumbnail: {
                    url: member.user.displayAvatarURL({ dynamic: true, size: 128 })
                },
                description: `:pencil: <@${member.user.id}> **roles have changed**`,
                fields,
                timestamp: new Date()
            }));
        }
    } catch (error: unknown) {
        logger.error(error as Error);
    }
};

