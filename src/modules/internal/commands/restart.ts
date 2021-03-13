import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { Collection } from 'discord.js';
import { colours } from '../../../utils/colours';

class Restart implements Command {
    public name = 'restart';

    getHelpText() {
        return 'Restarts the bot gracefully!';
    }

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in the bot's DMs and it's the bot's creator
        if (message.channel.type !== 'dm' || message.author.id !== client.ownerID) return;

        // Reply to user that we accepted the command
        await message.channel.send(new MessageEmbed({
            author: {
                name: 'Restarting bot...'
            }
        }));

        // Logout of discord gateway
        client.destroy();

        // Mark this as a successful exit
        process.exitCode = 0;

        // Stop node process
        process.exit();
    }
}

export const restart = new Restart();