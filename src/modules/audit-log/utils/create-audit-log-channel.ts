import type { Client, Message, OverwriteResolvable, GuildMember } from 'discord.js';

export const createAuditLogChannel = async (client: Client, message: GuildMember | Message) => {
    // This stops if it's not a guild, and we ignore all bots.
    // @todo: add the ability for servers to track specific bots or all bot message deletions
    if (!message.guild || (message as GuildMember)?.user?.bot || (message as Message)?.author?.bot) return;

    // Create named logger with id and name
    const logger = client.logger.createChild({
        prefix: message.guild.id
    }).createChild({
        prefix: message.guild.name
    });

    if (!message.guild.me?.hasPermission('MANAGE_CHANNELS')) {
        logger.silly('The #audit-log channel does not exist. I tried to create the channel but I am lacking permissions. :disappointed:');
        return;
    }

    // Get guild config
    const guildConfig = client.settings.get(message.guild.id)!;
    
    // Get roles
    const everyoneRole = message.guild.roles.cache.find(role => role.name === '@everyone');
    const adminRole = message.guild.roles.cache.find(role => [role.name, role.id].includes(guildConfig.roles.admin));
    const modRole = message.guild.roles.cache.find(role => [role.name, role.id].includes(guildConfig.roles.mod));
    
    // Generate permission overwrites
    const permissionOverwrites: OverwriteResolvable[] = [];
    if (everyoneRole) permissionOverwrites.push({ id: everyoneRole.id, deny: 'VIEW_CHANNEL' });
    if (adminRole) permissionOverwrites.push({ id: adminRole.id, allow: 'VIEW_CHANNEL' });
    if (modRole) permissionOverwrites.push({ id: modRole.id, allow: 'VIEW_CHANNEL' });
    
    // Create channel
    await message.guild.channels.create('audit-log', {
        type: 'text',
        permissionOverwrites
    });
};