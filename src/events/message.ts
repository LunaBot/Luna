import { MessageEmbed } from 'discord.js';
import type { Message, Client } from 'discord.js';
import { colours, isOwner, isAdmin } from '../utils';
import camelcase from 'camelcase';
import { CommandError } from 'errors';
import { Command } from '@lunabot/kaspar';
import { defaultSettings } from '../client';
import { Collection } from 'discord.js';
import { statsClient } from '../client';

const dmCommand = async (client: Client, message: Message) => {
	// Set prefix
	const prefix = '!';

	// Create named logger with id and name
	const logger = client.logger.createChild({
		prefix: 'DM'
	}).createChild({
		prefix: client.user?.username
	});

	// Then we use the config prefix to get our arguments and command:
	const args = message.content.split(/\s+/g);
	const commandName = args.shift()?.slice(1).toLowerCase();

	logger.silly('Prefix "%s" found in trying to run "%s"', prefix, message.content);

	// Unknown command
	if (!commandName || !client.commands.has(commandName)) return;
	const command = client.commands.get(commandName);

	// Couldn't find the command, maybe it crashed and unloaded?
	if (!command) {
		logger.silly(`Couldn't find a command called "%s"`, commandName);
		return;
	}

	// Run the command
	await Promise.resolve(command.run(client, message, args));
};

const checkPermissionsInGuild = async (client: Client, message: Message, command: Command) => {
	if (!message.guild) throw new CommandError(`\`${command.name}\` only works in guilds!`);
	if (!message.member) throw new CommandError('You must be a member to run this!');

	// Check if owner/admin
	if (!isOwner(message.guild, message.member) && !isAdmin(message.guild, message.member)) {
		// Check command level permissions
		const missingPermissions = command.userPermissions.filter(permission => !message.member?.hasPermission(permission));
		if (missingPermissions.length >= 1) {
			throw new CommandError(`You're missing the ${missingPermissions.map(permission => `"${permission}"`).join(', ')} permission(s).`);
		}
	}
};

const checkBotPermissions = async (client: Client, message: Message, command: Command) => {
	if (!message.guild) throw new CommandError(`\`${command.name}\` only works in guilds!`);
	if (!message.member) throw new CommandError('You must be a member to run this!');

	// Get me
	const me = message.guild.me;

	// Skip all checks if the bot has administrator
	if (me?.hasPermission('ADMINISTRATOR')) return;

	// Check command level permissions
	const missingPermissions = command.clientPermissions.filter(permission => me ? !me.hasPermission(permission) : false);
	if (missingPermissions.length >= 1) {
		throw new CommandError(`I'm missing the ${missingPermissions.map(permission => `"${permission}"`).join(', ')} permission(s).`);
	}
};

const getCommand = (client: Client, message: Message, commandName: string | undefined, guildConfig: typeof defaultSettings) => {
	// Create named logger with id and name
	const logger = client.logger.createChild({
		prefix: message.guild ? message.guild.id : message.author.id
	}).createChild({
		prefix: message.guild ? message.guild.name : `${message.author.username}#${message.author.discriminator}`
	});

	// Unknown command
	if (!commandName || !client.commands.has(commandName)) return;
	const command = client.commands.get(commandName);

	// Couldn't find the command, maybe it crashed and unloaded?
	if (!command) {
		logger.silly(`Couldn't find a command called "%s"`, commandName);
		return;
	}

	// Get command's module
	const commandModule = client.modules.find(commandModule => Object.keys(commandModule.commands).includes(camelcase(commandName)));

	// Couldn't find the module, maybe it crashed and unloaded?
	if (!commandModule) {
		logger.silly(`Couldn't find a module for the "%s" command.`, commandName);
		return;
	}

	// Check if the module is disabled
	const moduleName = camelcase(commandModule.name);

	// Bail if module is disabled
	if (guildConfig[moduleName] && !guildConfig[moduleName].enabled) return;

	return command;
};

const ratelimits = new Collection();

export const message = async (client: Client, message: Message) => {
	try {
		// Mark when we first see this
		message.startedProcessingTimestamp = new Date();

		// DMing the bot
		if (message.channel.type === 'dm') {
			return dmCommand(client, message);
		}

		// This stops if it's not a guild, and ignore all bots.
		if (!message.guild || message.author.bot || !message.member) {
			return;
		}

		// Don't allow the bot in any NSFW channels
		if (message.channel.type === 'text' && message.channel.nsfw) return;

		// Create named logger with id and name
		const logger = client.logger.createChild({
			prefix: message.guild.id
		}).createChild({
			prefix: message.guild.name
		});

		// If the user mentions the bot DIRECTLY then reply with it's info
		// For example `@Bot` but not `I think @Bot is a good bot!`
		if (client.user?.id && message.mentions.members?.has(client.user?.id) && message.content.split(/ +/g).length === 1) {
			// Run the help command
			await Promise.resolve(client.commands.get('help')?.run(client, message, []));
		}

		// Get guild configuration
		const guildConfig = client.settings.get(message.guild.id)!;

		// Bail if the message doesn't start with our prefix for this guild
		if (message.content.indexOf(guildConfig.prefix) !== 0) {
			logger.silly('Prefix "%s" not found in "%s"', guildConfig.prefix, message.content);
			return;
		}

		// Found the prefix
		logger.silly('Prefix "%s" found in "%s"', guildConfig.prefix, message.content);

		// Then we use the config prefix to get our arguments and command name
		const args = message.content.split(/\s+/g);
		const commandName = args.shift()?.slice((guildConfig.prefix || ' ').length).toLowerCase();

		const command = getCommand(client, message, commandName, guildConfig);

		// Bail since we don't have a command
		if (!command) return;

		// Validiate the bot has the needed permissions
		await checkBotPermissions(client, message, command);

		// Validiate the member has the needed permissions
		await checkPermissionsInGuild(client, message, command);

		// Tell stats a command was used
        await statsClient.commandUsed(commandName);

		// Run the command
		await Promise.resolve(command.run(client, message, args));
	} catch (error) {
		const embed = new MessageEmbed({
			color: colours.RED,
			description: `**Error**: ${error.message}`
		});
		try {
			await message.reply(embed);
		} catch {
			await message.reply(embed).catch(() => {});
		}
	}
}