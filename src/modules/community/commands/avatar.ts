import { Message, User } from 'discord.js';
import { ApplicationCommandOptionType, Command } from '@/command';
import { client } from '@/client';
import { AppError } from '@/errors';

export class Avatar extends Command {
    public name = 'Avatar';
    public command = 'avatar';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Get a member\s avatar link';
    public hidden = false;
    public owner = false;
    public examples = [
        '!avatar',
        '!avatar @OmgImAlexis#1546',
        '!avatar <@107834314439294976>',
        '!avatar 107834314439294976',
    ];
    public options = [{
        name: 'member',
        description: 'User whose avatar you want to see',
        type: ApplicationCommandOptionType.USER,
    }];

    async messageHandler(_prefix: string, message: Message, args: string[]) {
        // Check cache first only if it's missing do a fetch
        const user = message.mentions.users.first() ?? args[0] ? (client.users.cache.get(args[0]) ?? await client.users.fetch(args[0])) : undefined;

        // Couldn't resolve user
        if (!user && args.length >= 1) {
            throw new AppError(`Couldn't resolve user ID ${args.join(' ')}`);
        }

        // No user but they didn't try and look for one
        // So just return their own
        if (!user) {
            return this.handler(message.author);
        }
        return this.handler(user);
    }

    async handler(user: User) {
        return user.displayAvatarURL({ dynamic: true });
    } 
};
