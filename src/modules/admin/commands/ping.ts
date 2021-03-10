import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { colours } from '../../../utils';

class Ping implements Command {
    public name = 'ping';

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        const timeSinceMessageCreation = (Date.now() - message.createdTimestamp) - client.ws.ping;
        const timeToProcessMessage = Date.now() - message.startedProcessingTimestamp.getTime();
        const pingMessage = `Pong!\nIt has been \`${timeSinceMessageCreation}ms\` since you sent that command.\nIt took me \`${timeToProcessMessage}ms\` to process this command.`;

        // Send ping
        const msg = await message.channel.send(new MessageEmbed({
            title: 'Pinging...',
            color: colours.ORANGE
        }));

        // Send pong
        await msg.edit(new MessageEmbed({
            title: 'Pong!',
            description: "Bot Latency: ``" + Math.floor(msg.createdTimestamp - message.createdTimestamp) + " ms``\nAPI Latency: ``" + Math.round(client.ws.ping) + " ms``",
            color: colours.GREEN
        }));
	}
};

export const ping = new Ping();