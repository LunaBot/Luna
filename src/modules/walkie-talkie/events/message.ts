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

    // Send message to others in network
    // @todo: investigate if this needs to be done in series because of the edit to the webhook we do
    await Promise.all([...client.walkieTalkies.entries()].filter(([, walkieTalkie]) => {
        return walkieTalkie.token !== '';
    }).map(async ([guildId, { id, token }]) => {
        // Don't send the message to the guild where it was sent from
        if (guildId === message.guild?.id) return;

        // Get webhook
        const webhook = await client.fetchWebhook(id, token);

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
            const member = client.guilds.cache.get(guildId)?.members.cache.find(member => member.id === match);
            return `@${zeroWidthCharacter}${member?.nickname ?? member?.user.username}` ?? match;
        });

        // Resolve roles to their names
        cleanMessage = cleanMessage.replace(/<@&?(\d+)>/, (_, match) => {
            const member = client.guilds.cache.get(guildId)?.members.cache.find(member => member.id === match);
            return `@${zeroWidthCharacter}${member?.nickname ?? member?.user.username}` ?? match;
        });

        // Log for debugging
        client.logger.debug('Forwarding to network: %s', cleanMessage);

        // Send message
        await webhook.send(cleanMessage);
    }));
};
