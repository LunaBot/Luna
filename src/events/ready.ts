import { client } from '../client';
import { statcord } from '../statcord';

export const ready = async () => {
	const guildsCount = client.guilds.cache.size;
    await client.user?.setActivity({
        name: `${guildsCount} server${guildsCount === 1 ? '' : 's'}`,
        type: 'WATCHING'
    });

    // Log for debugging
	client.logger.info('I am ready!');

    // Start auto posting
    statcord.autopost();
};
