import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';

class Report implements Command {
    public name = 'report';

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        // Relay report to my self
        // @todo: turn this into an embed
        // @todo: move the id to a dynamic location instead of hardcoding it
        const dmChannel = message.guild.members.cache.get('107834314439294976');
        await dmChannel?.send(message.content);
	}
};

export const report = new Report();