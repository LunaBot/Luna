import { client } from '../client';
import { statcord } from '../statcord';

export const ready = async () => {
	const guildsCount = client.guilds.cache.size;

    // Idk what happened?
    if (!client.user) return;

    // Set activity
    await client.user.setActivity({
        name: `${guildsCount} server${guildsCount === 1 ? '' : 's'}`,
        type: 'WATCHING'
    });

    // Log for debugging
	client.logger.info(`${client.user.tag}, Ready to serve ${client.guilds.cache.size} guilds and ${client.users.cache.size} users`);

    // Start auto posting to statcord
    statcord.autopost();
};
