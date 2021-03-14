import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';

class __Commandname__ implements Command {
    public name = '__commandname__';

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;
    }
}

export const __commandname__ = new __Commandname__();