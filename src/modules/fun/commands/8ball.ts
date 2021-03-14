import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';

class 8ball implements Command {
    public name = '8ball';

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;
    }
}

export const 8ball = new 8ball();
