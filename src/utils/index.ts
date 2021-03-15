import type { Guild, GuildMember, GuildChannel, TextChannel } from 'discord.js';
import { client } from '../client';

export * from './colours';
export * from './small-stack';

export const isOwner = (guild: Guild, member: GuildMember) => {
    const isGuildOwner = guild.ownerID === member.id;
    const isBotOwner = client.ownerID === member.id;
    return isGuildOwner || isBotOwner;
};

export const isAdmin = (guild: Guild, member: GuildMember) => {
    const guildConfig = client.settings.get(guild.id);

    client.logger.debug('Looking for admin role');
    const adminRole = guild.roles.cache.find(role => {
        return [role.id, role.name].includes(guildConfig?.roles.admin ?? 'Admin');
    });

    // Couldn't find a admin role
    if (!adminRole) {
        client.logger.debug(`Couldn't find a admin role`);
        return false;
    }

    // Found a admin role
    client.logger.debug('Found admin role "%s"', adminRole.name);
    return member.roles.cache.has(adminRole.id);
};

export const isMod = async (guild: Guild, member: GuildMember) => {
    const guildConfig = client.settings.get(guild.id);

    client.logger.debug('Looking for mod role');
    const modRole = guild.roles.cache.find(role => [role.id, role.name].includes(guildConfig?.roles.mod ?? 'Mod'));

    // Couldn't find a mod role
    if (!modRole) {
        client.logger.debug(`Couldn't find a mod role`);
        return false;
    }

    // Found a mod role
    client.logger.debug('Found mod role "%s"', modRole.name);
    return member.roles.cache.has(modRole.id);
};

export const resolvePlaceholders = ({
    string, guild, member, channel
}: {
    string: string, guild: Guild, member: GuildMember, channel?: GuildChannel
}) => {
    let resolvedString = string;

    // Bail if there's no string to process
    if (!resolvedString) return;

    resolvedString = resolvedString.replace('{user}', `<@${member.user.id}>`);
    resolvedString = resolvedString.replace('{user.id}', member.user.id);
    resolvedString = resolvedString.replace('{user.discriminator}', member.user.discriminator);
    resolvedString = resolvedString.replace('{user.username}', member.user.username);
    resolvedString = resolvedString.replace('{username}', member.user.username);
    resolvedString = resolvedString.replace('{server}', guild.name);
    if (channel) {
        resolvedString = resolvedString.replace('{channel}', channel.name);
        resolvedString = resolvedString.replace('{channel.id}', channel.id);
        resolvedString = resolvedString.replace('{channel.name}', channel.name);
    }
    // resolvedString = resolvedString.replace('{@(?<user>.*)}', '<@$1>');
    // resolvedString = resolvedString.replace('{&(?<role>.*)}', '<&$1>');
    resolvedString = resolvedString.replace(/{#(?<channel>.*)}/, (_, match) => {
        const channel = guild.channels.cache.find(channel => channel.id === match || channel.name === match);
        return channel?.id ? `<#${channel?.id}>` : match;
    });
    // resolvedString = resolvedString.replace('{everyone}', '@everyone');
    // resolvedString = resolvedString.replace('{here}', '@here');
    return resolvedString;
};

export const isTextChannel = (channel: GuildChannel): channel is TextChannel => channel.type === 'text';

export const sendWelcomeMessage = (member: GuildMember) => {
	// Get the welcome message and resolve all the placeholders
	const welcomeMessage = resolvePlaceholders({
		string: client.settings.get(member.guild.id, 'welcome.message')!,
		guild: member.guild,
		member
	});

    // Bail if we after resolving, the string is empty
    if (!welcomeMessage) return;

	// Send welcome message to the welcome channel
	const welcomeChannel = member.guild.channels.cache.find(channel => isTextChannel(channel) && channel.name === client.settings.get(member.guild.id, 'welcome.channel')) as TextChannel;
    if (!welcomeChannel) return;

    // Send welcome message
	welcomeChannel.send(welcomeMessage);
};

export const sleep = (number: number) => new Promise<void>(resolve => setTimeout(() => resolve(), number));

export const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

export const levelToExperience = (level: number) => {
    let experience = 0;
    for (let i = 1; i < level; i++) experience += Math.floor(i + 300 * Math.pow(2, i / 7));
    return Math.floor(experience / 4);
};

export const experienceToLevel = (experience: number) => {
    let level = 0;
    while (levelToExperience(level) < experience) level++;
    return level;
};
