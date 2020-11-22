import { log } from '../log';

export const warn = (...args: any[]) => {
    log.warn('warning', ...args);
};
