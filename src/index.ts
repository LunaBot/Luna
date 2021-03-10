import { MessageEmbed } from 'discord.js';
import dotEnv from 'dotenv';
import { colours } from './utils';
import { client } from './client';
import { loadModules } from './loader';

// Load env values
dotEnv.config();

client.on('ready', () => {
	client.logger.info('I am ready!');
});

client.on('error', console.error);

client.on('guildDelete', guild => {
	// When the bot leaves or is kicked, delete settings to prevent stale entries.
	client.settings.delete(guild.id);
});

client.on('message', async message => {
	try {
		// Mark when we first see this
		message.startedProcessingTimestamp = new Date();

		// This stops if it's not a guild, and we ignore all bots.
		if (!message.guild || message.author.bot || !message.member) {
			return;
		}

		// We get the value, and autoEnsure guarantees we have a value already.
		const guildConfig = client.settings.get(message.guild.id);

		// Now we can use the values! We stop processing if the message does not
		// start with our prefix for this guild.
		if (message.content.indexOf(guildConfig.prefix) !== 0) {
			client.logger.debug('Prefix "%s" not found in "%s"', guildConfig.prefix, message.content)
			return;
		}

		// Then we use the config prefix to get our arguments and command:
		const args = message.content.split(/\s+/g);
		const commandName = args.shift()?.slice((guildConfig.prefix || ' ').length).toLowerCase();

		client.logger.debug('Prefix "%s" found in trying to run "%s"', guildConfig.prefix, commandName);

		// Unknown command
		if (!commandName || !client.commands.has(commandName)) return;
		const command = client.commands.get(commandName);

		// Couldn't find the command, maybe it crashed and unloaded?
		if (!command) return;

		// Run the command
		await Promise.resolve(command.run(client, message, args));
	} catch (error) {
		const embed = new MessageEmbed({
			color: colours.RED,
			description: `**Error**: ${error.message}`
		});
		message.reply(embed);
	}
});

const main = async () => {
	// Load all modules, events and commands
	await loadModules(client);

	// Login to the discord bot gateway
	await client.login(process.env.BOT_TOKEN);
};

main();
