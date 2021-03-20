import { Command } from '@lunabot/kaspar';
import type { Message, Client } from 'discord.js';

class Volume extends Command {
    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;
    }
}

export const volume = new Volume();
