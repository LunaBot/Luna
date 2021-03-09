import { MessageEmbed, GuildFeatures } from 'discord.js';
import dotEnv from 'dotenv';
import { colours, isAdmin, isOwner, sendWelcomeMessage } from './utils';
import { CommandError } from './errors';
import { client, defaultSettings } from './client';
import { loadModules } from './loader';

// Load env values
dotEnv.config();

client.on('ready', () => {
	console.log('I am ready!');
});

client.on('error', console.error);

client.on('guildDelete', guild => {
	// When the bot leaves or is kicked, delete settings to prevent stale entries.
	client.settings.delete(guild.id);
});

// // This executes when a member joins
// client.on('guildMemberAdd', member => {
// 	// First, ensure the settings exist
// 	client.settings.ensure(member.guild.id, defaultSettings);

// 	// If the guild is using the member verification gate then don't welcome them until they've passed
// 	if (member.guild.features.includes('MEMBER_VERIFICATION_GATE_ENABLED' as GuildFeatures)) {
// 		return;
// 	}

// 	// Send the welcome message
// 	sendWelcomeMessage(member);
// });

// // This executes when a member updates
// client.on('guildMemberUpdate', async (oldMember, newMember) => {
// 	// First, ensure the settings exist
// 	client.settings.ensure(newMember.guild.id, defaultSettings);

//     // Member passed membership screening
//     if (oldMember.pending && !newMember.pending) {
// 		sendWelcomeMessage(newMember);
//     }
// });

client.on('message', async message => {
	try {
		// This stops if it's not a guild, and we ignore all bots.
		if (!message.guild || message.author.bot || !message.member) {
			return;
		}

		// We get the value, and autoEnsure guarantees we have a value already.
		const guildConfig = client.settings.get(message.guild.id);

		// Now we can use the values! We stop processing if the message does not
		// start with our prefix for this guild.
		// if (message.content.indexOf(guildConfig.prefix) !== 0) {
		// 	return;
		// }

		// Then we use the config prefix to get our arguments and command:
		const args = message.content.split(/\s+/g);
		const command = args.shift()?.slice((guildConfig.prefix || ' ').length).toLowerCase();

		// Commands Go Here

		// Alright. Let's make a command! This one changes the value of any key
		// in the configuration.
		if (command === 'setconf') {
			// Command is owner/admin only
			if (!isOwner(message.guild, message.member) && !isAdmin(message.guild, message.member)) {
				throw new CommandError('You\'re not an admin or the owner, sorry!');
			}

			// Let's get our key and value from the arguments.
			const [prop, ...value] = args;
			// Example:
			// prop: "prefix"
			// value: ["+"]
			// (yes it's an array, we join it further down!)

			// Prevent the config being set to ""
			if (!prop || String(value).trim().length === 0) {
				throw new CommandError('Please provide a property and value.');
			}

			// Only allow existing keys to be updated
			if (!client.settings.has(message.guild.id, prop)) {
				throw new CommandError('This key is not in the configuration.');
			}

			// Now we can finally change the value. Here we only have strings for values
			// so we won't bother trying to make sure it's the right type and such.
			client.settings.set(message.guild.id, value.join(' '), prop);

			// Let the user know all is good.
			message.channel.send(`Guild \`${prop}\` has been changed to "${value.join(' ')}".`);
		}

		if (command === 'resetconf') {
			// Command is owner/admin only
			if (!isOwner(message.guild, message.member) && !isAdmin(message.guild, message.member)) {
				throw new CommandError('You\'re not an admin or the owner, sorry!');
			}

			client.settings.set(message.guild.id, defaultSettings);

			// Let the user know all is good.
			message.channel.send('Reset guild settings.');
		}

		if (command === 'showconf') {
			// Command is owner/admin only
			if (!isOwner(message.guild, message.member) && !isAdmin(message.guild, message.member)) {
				throw new CommandError('You\'re not an admin or the owner, sorry!');
			}

			message.channel.send(`The following are the server's current configuration:\n\`\`\`${JSON.stringify(guildConfig, null, 2)}\`\`\``);
		}
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
