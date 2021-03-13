import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { isOwner, isAdmin } from '../../../utils';
import { CommandError } from '../../../errors';
import { Collection } from 'discord.js';

class Whois implements Command {
    public name = 'whois';
    public paramaters = new Collection(Object.entries({
        user: {
            type: 'mention' as const
        }
    }));

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

    	// Command is owner/admin only
        if (!isOwner(message.guild, message.member) && !isAdmin(message.guild, message.member)) {
            throw new CommandError('You\'re not an admin or the owner, sorry!');
        }

        // First person mentioned
        const user = message.mentions.users.first() ?? message.author;
        const member = await message.guild.members.fetch({
            user
        });

        // Send whois
        await message.channel.send(new MessageEmbed({
            author: {
                name: `This is ${user.username}`
            },
            fields: [{
                name: 'Name',
                value: user.username,
                inline: true
            }, {
                name: 'Discriminator',
                value: user.discriminator,
                inline: true
            }, {
                name: 'Mention',
                value: `<@${user.id}>`,
                inline: true
            }, {
                name: 'User ID',
                value: user.id,
                inline: true
            }, {
                name: 'User status',
                value: user.presence.status.charAt(0).toUpperCase() + user.presence.status.slice(1),
                inline: true
            }, {
                name: 'Game Status',
                value: user.presence.activities[0] || "No game status",
                inline: true
            }, {
                name: 'Account Creation Date',
                value: user.createdAt?.toLocaleDateString(),
                inline: true
            }, {
                name: 'Join Date',
                value: member.joinedAt?.toLocaleDateString(),
                inline: true
            }, {
                name: 'Bot/Human',
                value: user.bot ? 'Bot' : 'Human',
                inline: true
            }, {
                name: 'Roles',
                value: member.roles.cache.map(role => role.name !== '@everyone' ? role.name : "").join(' ') || "No roles",
                inline: true
            }]
        }));
    }
}

export const whois = new Whois();
