import type { Guild, GuildMember, GuildChannel, TextChannel } from 'discord.js';
import { client } from '../client';

export * from './colours';
export * from './small-stack';

export const isOwner = (guild: Guild, member: GuildMember) => guild.ownerID === member.id;
export const isAdmin = (guild: Guild, member: GuildMember) => {
    const guildConfig = client.settings.get(guild.id);
    const adminRole = guild.roles.cache.find(role => role.name === guildConfig.adminRole);
    return adminRole ? member.roles.cache.has(adminRole.id) : false;
};

export const resolvePlaceholders = ({
    string, guild, member, channel
}: {
    string: string, guild: Guild, member: GuildMember, channel?: GuildChannel
}) => {
    let resolvedString = string;
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
		string: client.settings.get(member.guild.id, 'welcomeMessage'),
		guild: member.guild,
		member
	});

	// Send welcome message to the welcome channel
	const welcomeChannel = member.guild.channels.cache.find(channel => isTextChannel(channel) && channel.name === client.settings.get(member.guild.id, 'welcomeChannel')) as TextChannel;
	welcomeChannel.send(welcomeMessage).catch(console.error);
};