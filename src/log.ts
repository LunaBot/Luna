import { Logger } from 'logger';

export const log = new Logger({
    prefix: 'AutoMod',
    prefixSeperator: '] ['
});

export const moduleLogger = log.createChild();
