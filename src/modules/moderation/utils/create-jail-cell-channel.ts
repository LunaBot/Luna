import type { Client, Message, OverwriteResolvable, GuildMember } from 'discord.js';
import { CommandError } from '../../../errors';

export const createJailCellChannel = async (client: Client, message: Message) => {
    // This stops if it's not a guild, and we ignore all bots.
    // @todo: add the ability for servers to track specific bots or all bot message deletions
    if (!message.guild || message.author.bot) return;

    // Create named logger with id and name
    const logger = client.logger.createChild({
        prefix: message.guild.id
    }).createChild({
        prefix: message.guild.name
    });

    if (!message.guild.me?.hasPermission('MANAGE_CHANNELS')) {
        logger.silly(
            'The #jail-cell-%s-%s channel does not exist. I tried to create the channel but I am lacking permissions. :disappointed:',
            message.author.username,
            message.author.discriminator
        );
        return;
    }

    // Get the user we need to jail
    const memberToJail = message.mentions.members?.first();

    // Bail if we don't have someone to jail
    if (!memberToJail) throw new CommandError('You need to mention a user to jail them!');

    // Get guild config
    const guildConfig = client.settings.get(message.guild.id)!;
    
    // Get `@everyone` role
    const everyoneRole = message.guild.roles.cache.find(role => role.name === '@everyone');
    
    // Generate permission overwrites
    const permissionOverwrites: OverwriteResolvable[] = [];
    if (everyoneRole) permissionOverwrites.push({ id: everyoneRole.id, deny: 'VIEW_CHANNEL' });
    permissionOverwrites.push({ id: memberToJail.id, allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] });
    
    // Create channel
    await message.guild.channels.create(`jail-cell-${memberToJail.user.username}-${memberToJail.user.discriminator}`, {
        type: 'text',
        permissionOverwrites
    });
};