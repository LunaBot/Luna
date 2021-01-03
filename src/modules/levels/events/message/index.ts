import { Message } from 'discord.js';
import { Server } from '@/servers';
import { UserExperience } from './user-experience';
import humanizeDuration from 'humanize-duration';
import { log } from '@/log';

let isStarting = true;
export const message = async (message: Message) => {

    // Skip bot messages
    if (message.author.bot) return;

    // Skip if bot is still starting up
    if (isStarting) {
        // Will be false after 10s of uptime
        isStarting = process.uptime() <= 10;

        // Is still under 10s bail
        if (isStarting) {
            log.silly(`Skipping message as bot has only been up for ${humanizeDuration(process.uptime() * 1000)}.`);
            return;
        }
    }

    // Process experience and save to db
    const server = await Server.findOrCreate({ id: message.guild!.id });
    const user = await server.getUser({ id: message.member!.id });
    const userExperience = new UserExperience(server, user, message);
    await userExperience.process();
};
