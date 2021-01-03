import { log } from '@/log';
import { moduleUnloaded } from './module-unloaded';
import { moduleLoaded } from './module-loaded';

export const moduleReload = async () => {
    await moduleUnloaded();
    await moduleLoaded();
    log.debug('Levels module was reloaded!');
};
