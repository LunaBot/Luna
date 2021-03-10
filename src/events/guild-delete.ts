import type { Client, Guild } from 'discord.js';

export const guildDelete = (client: Client, guild: Guild) => {
	// When the bot leaves or is kicked, delete settings to prevent stale entries.
	client.settings.delete(guild.id);
};