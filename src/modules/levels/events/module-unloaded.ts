import { log } from '@/log';

export const moduleUnloaded = async () => {
    log.debug('Levels module was unloaded!');
};