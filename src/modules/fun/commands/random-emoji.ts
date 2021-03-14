import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';

class Random-emoji implements Command {
    public name = 'random-emoji';

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;
    }
}

export const random-emoji = new Random-emoji();
