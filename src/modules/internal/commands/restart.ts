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
        // Bail unless we're in the bot's DMs
        if (message.channel.type !== 'dm') return;

        // Report people who aren't the bot's creator
        if (message.author.id !== client.ownerID) {
            // Log command to creator
            const creator = await client.users.fetch(client.ownerID);
            await creator?.send(new MessageEmbed({
                author: {
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL(),
                },
                fields: [{
                    name: 'Illegal command usage',
                    value: '`' + message.content + '`'
                }]
            }));

            // Reply to user that we denied the command
            await message.channel.send(new MessageEmbed({
                author: {
                    name: `Sorry I was told not to talk to strangers. Maybe get to know me first?`
                }
            }));

            // Bail
            return;
        }

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