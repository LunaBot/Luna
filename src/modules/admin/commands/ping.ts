import { Command } from '@lunabot/kaspar';
import type { Message, Client } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { colours } from '../../../utils';

class Ping extends Command {
    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        // Send ping
        const ping = await message.channel.send(new MessageEmbed({
            title: 'Pinging...',
            color: colours.ORANGE
        }));

        // Send pong
        await ping.edit(new MessageEmbed({
            title: 'Pong!',
            description: "Bot Latency: ``" + Math.floor(ping.createdTimestamp - message.createdTimestamp) + " ms``\nAPI Latency: ``" + Math.round(client.ws.ping) + " ms``",
            color: colours.GREEN
        }));
	}
};

export const ping = new Ping();