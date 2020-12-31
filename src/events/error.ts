import { DiscordAPIError } from 'discord.js';
import { log } from '../log';

export const error = (error: NodeJS.ErrnoException | DiscordAPIError) => {
    if (error instanceof DiscordAPIError) {
        log.error(JSON.stringify(error, null, 2));
    } else {
        log.error(error);
    }
};
