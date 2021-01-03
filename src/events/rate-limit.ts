import { log } from '@/log';

export const rateLimit = async (...args: any[]) => {
    log.debug('Currently rate limited', args);
};
