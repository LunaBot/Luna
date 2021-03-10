import { client } from '../client';

export const ready = () => {
	client.logger.info('I am ready!');
};
