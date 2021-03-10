import { client } from '../client';

export const ready = async () => {
	const guildsCount = client.guilds.cache.size;
    await client.user?.setActivity({
        name: `${guildsCount} server${guildsCount === 1 ? '' : 's'}`,
        type: 'WATCHING'
    });

	client.logger.info('I am ready!');
};
