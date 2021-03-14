import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';

class Resume implements Command {
    public name = 'resume';

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;
    }
}

export const resume = new Resume();
