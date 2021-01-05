import { moduleManager } from '@/module-manager';
import { Message } from 'discord.js';
import type { Help } from '@/modules/bot/commands/help'
import { Server } from '@/servers';

// Bot was mentioned
export const mentioned = async (message: Message) => {
    const help = moduleManager.getCommand('help') as Help;
    const server = await Server.findOrCreate({ id: message.guild!.id });
    const response = await help.handler(server.prefix);

    // Send the help menu
    await message.channel.send(response);
};
