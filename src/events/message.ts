import { MessageEmbed } from 'discord.js';
import type { Message, Client } from 'discord.js';
import { colours } from '../utils';
import camelcase from 'camelcase';
import { TextChannel } from 'discord.js';
import { statcord } from '../statcord';

export const message = async (client: Client, message: Message) => {
	try {
		// Mark when we first see this
		message.startedProcessingTimestamp = new Date();

		// This stops if it's not a guild, and we ignore all bots.
		if (!message.guild || message.author.bot || !message.member) {
			return;
		}

		// Don't allow the bot in any NSFW channels
		if ((message.channel as TextChannel).nsfw) return;

		// Create named logger with id and name
		const logger = client.logger.createChild({
			prefix: message.guild.id
		}).createChild({
			prefix: message.guild.name
		});

		// If the user mentions the bot DIRECTLY then reply with it's info
		// For example `@Bot` but not `I think @Bot is a good bot!`
		if (client.user?.id && message.mentions.has(client.user?.id) && message.content.trim().startsWith('<')) {
			// Run the help command
			await Promise.resolve(client.commands.get('help')?.run(client, message, []));
		}

		// We get the value, and autoEnsure guarantees we have a value already.
		const guildConfig = client.settings.get(message.guild.id)!;

		// Bail if the message doesn't start with our prefix for this guild
		if (message.content.indexOf(guildConfig.prefix) !== 0) {
			logger.silly('Prefix "%s" not found in "%s"', guildConfig.prefix, message.content)
			return;
		}

		// Then we use the config prefix to get our arguments and command:
		const args = message.content.split(/\s+/g);
		const commandName = args.shift()?.slice((guildConfig.prefix || ' ').length).toLowerCase();

		logger.silly('Prefix "%s" found in trying to run "%s"', guildConfig.prefix, message.content);

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

		// Post command
		statcord.postCommand(commandName, message.author.id);

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