import type { TextChannel, Client, Message } from 'discord.js';

// This does contain a character
const zeroWidthCharacter = '​';

export const message = async (client: Client, message: Message) => {
    // This stops if it's not a guild, and we ignore all bots.
    if (!message.guild || message.author.bot || !message.member) {
        return;
    }

    // Don't allow the bot in any NSFW channels
    if ((message.channel as TextChannel).nsfw) return;

    // Get guild config
    const guildConfig = client.settings.get(message.guild.id)!

    // Bail if the guild is banned from using walkie-talkie
    if (client.customers.get(message.guild.id)?.banned) return;

    // Bail if it's a command;
    if (message.content.indexOf(guildConfig.prefix) === 0) return;

    // Bail if walk-talkie is disabled
    if (!guildConfig.walkieTalkie.enabled) return;

    // Bail if this is the wrong channel
    if (guildConfig.walkieTalkie.channel !== message.channel.id) return;

    // Bail if the content is less than 2 chars
    if (message.content.length <= 2) return;

    // Log for debugging
    client.logger.debug('Forwarding to network: %s', message.content);

    // Send message to others in network
    await Promise.allSettled([...client.walkieTalkies.entries()].filter(([key, walkieTalkie]) => {
        return walkieTalkie.token !== '';
    }).map(async ([guildId, { id, token }]) => {
        // Don't send the message to the guild where it was sent from
        if (guildId === message.guild?.id) return;

        // Get webhook
        const webhook = await client.fetchWebhook(id, token).catch(() => {
            // Reset id and token if the webhook fails
            // It's likely been deleted
            client.walkieTalkies.set(guildId, '', 'id');
            client.walkieTalkies.set(guildId, '', 'token');
        });

        // Bail if we're missing out webhook
        if (!webhook) return;

        // Update current user
        await webhook.edit({
            name: message.author.username,
            avatar: message.author.displayAvatarURL()
        });

        // Clear mentions from message
        let cleanMessage = message.content;

        // Resolve everyone
        cleanMessage = cleanMessage.replace('@everyone', `@${zeroWidthCharacter}everyone`);

        // Resolve here
        cleanMessage = cleanMessage.replace('@here', `@${zeroWidthCharacter}here`);

        // Resolve members to their names
        // @todo: Look into allowing pings but only where that member is current "online"
        //        This would allow chat to "follow" the user across servers
        cleanMessage = cleanMessage.replace(/<@!?(\d+)>/, (_, match) => {
            const memberFromNetwork = client.guilds.cache.get(guildId)?.members.cache.find(member => member.id === match);
            const memberFromOrigin = message.guild?.members.cache.find(member => member.id === match);
            const member = memberFromNetwork ?? memberFromOrigin;
            return `@${zeroWidthCharacter}${member?.nickname ?? member?.user.username ?? match}`;
        });

        // Resolve roles to their names
        cleanMessage = cleanMessage.replace(/<@&?(\d+)>/, (_, match) => {
            const roleFromNetwork = client.guilds.cache.get(guildId)?.roles.cache.find(role => role.id === match);
            const roleFromOrigin = message.guild?.roles.cache.find(role => role.id === match);
            const role = roleFromNetwork ?? roleFromOrigin;
            return `@${zeroWidthCharacter}${role?.name ?? match}`;
        });

        // Send message
        await webhook.send(cleanMessage);
    }));
};
