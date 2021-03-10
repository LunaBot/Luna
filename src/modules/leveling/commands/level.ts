import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';

class Level implements Command {
    public name = 'level';

    async run(client: Client, message: Message, args: string[]) {
        
    }
};

export const level = new Level();