import { log } from '../log';

export const error = (error: NodeJS.ErrnoException) => {
    log.error(error);
};
