import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';

class Rps implements Command {
    public name = 'rps';

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;
    }
}

export const rps = new Rps();
