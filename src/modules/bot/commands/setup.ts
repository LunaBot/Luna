import { Command } from '@/command';
import { AppError } from '@/errors';
import type { Message, CollectorFilter, Interaction } from 'discord.js';

const filter: CollectorFilter = (response) => !response.author.bot;
const waitForAdminRoles = async (message: Message) => {
    return message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] }).then(collected => {
        return collected.flatMap(answer => answer.mentions.roles);
    }).catch(_collected => {
        throw new AppError('you took too long to respond.');
    });
};

export class Setup extends Command {
    public name = 'Setup';
    public command = 'setup';
    public timeout = 20000;
    public description = 'Set me up captain!';
    public hidden = false;
    public owner = true;
    public examples = [];
    public permissions = ['ADMINISTRATOR' as const];
    public options = [];

    messageHandler(_prefix: string, message: Message, _args: string[]) {
        return this.handler(_prefix, message);
    }

    interactionHandler(_prefix: string, _interaction: Interaction) {
        throw new Error('Not allowed!');
    }

    async handler(_prefix: string, message: Message) {
        // What roles do admins have?
            // Please tag the admin's role
        // What roles do mods have?
            // Please tag the mod's role
        
        // Ask the question
        await message.channel.send('What roles do your admins use?');

        // Wait for the answer
        const mentioned = await waitForAdminRoles(message);

        // Get the role(s) mentioned
        if (!mentioned || mentioned.size === 0) {
            message.reply('no role(s) mentioned, try again.');
            await waitForAdminRoles(message);
        }

        // Update server's settings

        // One role
        if (mentioned.size === 1) {
            return `<@&${mentioned.first()?.id}> has been marked as an admin role!`;
        }

        // Multiple roles
        return `${mentioned.map(mention => `<@&${mention.id}>`).join(' ')} have all been marked as admin roles!`;
    }
};
