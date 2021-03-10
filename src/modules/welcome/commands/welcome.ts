import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';

class Welcome implements Command {
    public id = 'WELCOME';
    public name = 'welcome';

    run(client: Client, message: Message) {
        // Bail unless we're in a guild and a member run this
        if (!message.guild || !message.member) return;	
    }
};

export const welcome = new Welcome();