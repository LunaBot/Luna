import { Message, CollectorFilter } from 'discord.js';
import { Command } from '../command';
import { AppError } from '../errors';
import { getUserFromMention } from '../utils';

const filter: CollectorFilter = (response) => !response.author.bot;
const waitForAdminRoles = async (message: Message) => {
    return message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] }).then(collected => {
        return collected.map(answer => getUserFromMention(answer.content)).filter(Boolean);
    }).catch(_collected => {
        throw new AppError('you took too long to respond.');
    });
};

class Setup extends Command {
    public name = 'setup';
    public command = 'setup';
    public timeout = 5000;
    public description = 'Set me up captain!';
    public hidden = true;
    public owner = false;
    public examples = [];
    public roles = [ 'test-role'  ];

    async handler(_prefix: string, message: Message, _args: string[]) {
        // What roles do admins have?
            // Please tag the admin's role
        // What roles do mods have?
            // Please tag the mod's role
        
        // Ask the question
        await message.channel.send('What roles do your admins use?');

        // Wait for the answer
        const mentioned = await waitForAdminRoles(message);

        // Get the role(s) mentioned
        if (!mentioned || mentioned.length === 0) {
            message.reply('no role(s) mentioned, try again.');
            await waitForAdminRoles(message);
        }

        // Update server's settings

        if (mentioned.length === 1 && mentioned[0]) {
            return `@${mentioned[0].username} has been marked as an admin role!`;
        }

        return `${mentioned.map(user => `@${user?.username}`)} have been marked as admin roles!`;
    }
};

export default new Setup();
