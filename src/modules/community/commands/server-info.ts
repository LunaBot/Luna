import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { capitalizeFirstLetter } from '../../../utils';

class ServerInfo implements Command {
    public name = 'server-info';

    async run(client: Client, message: Message, args: string[]) {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        const absoluteCreationDate = '';
        const relativeCreationDate = '';

        message.channel.send(new MessageEmbed({
            title: message.guild.name,
            thumbnail: {
                url: message.guild.iconURL({ format: 'png' })!
            },
            fields: [{
                name: 'Server ID',
                value: message.guild.id,
                inline: true,
            }, {
                name: 'Owner',
                value: message.guild.owner?.user.username,
                inline: true,
            }, {
                name: 'Members',
                value: message.guild.members.cache.filter(member => member.presence.status !== "offline").size,
            }, {
                name: 'Channels',
                value: message.guild.channels.cache.size,
            }, {
                name: 'Roles',
                value: message.guild.roles.cache.size,
                inline: true,
            }, {
                name: 'Emojis',
                value: message.guild.emojis.cache.size,
                inline: true,
            }, {
                name: 'Voice region',
                value: message.guild.region,
            }, {
                name: 'Ban count',
                value: (await message.guild.fetchBans()).size
            }, {
                name: 'Boosts',
                value: message.guild.premiumSubscriptionCount
            }, {
                name: 'Features',
                value: message.guild.features.map(feature => capitalizeFirstLetter(feature.toLowerCase().replace(/\_/g, ' '))).join('\n')
            }],
            footer: {
                text: `Created: ${absoluteCreationDate} (${relativeCreationDate})`
            }
        }))
    }
};

export const serverInfo = new ServerInfo();