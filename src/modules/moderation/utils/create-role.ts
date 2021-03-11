import type { Client, Message } from 'discord.js';

export const createRole = async (client: Client, message: Message) => {
    // This stops if it's not a guild, and we ignore all bots.
    // @todo: add the ability for servers to track specific bots or all bot message deletions
    if (!message.guild || message.author.bot) return;

    // Get guild config
    const guildConfig = client.settings.get(message.guild.id)!

    // Creat role
    const mutedRole = await message.guild.roles.create({
        data: {
            name: (guildConfig.roles.muted ?? 'muted'),
            mentionable: false
        }
    });

    // Mute the role in each channel
    await Promise.allSettled(message.guild.channels.cache.map(async channel => {
        await channel.createOverwrite(mutedRole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
            SPEAK: false
        });
    }));
}