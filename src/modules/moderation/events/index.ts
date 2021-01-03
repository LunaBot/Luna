import { log } from '@/log';

export const moduleLoaded = async () => {
    log.debug('Moderation module is loaded!');
};

export const moduleUnloaded = async () => {
    log.debug('Moderation module was unloaded!');
};

export const moduleReload = async () => {
    await moduleUnloaded();
    await moduleLoaded();
    log.debug('Moderation module was reloaded!');
};
