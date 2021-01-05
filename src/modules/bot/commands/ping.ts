import { client } from '@/client';
import { Command } from '@/command';
import type { Interaction, Message } from 'discord.js';

export class Ping extends Command {
    public name = 'Ping';
    public command = 'ping';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Check the bot\'s latency.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public roles = [ '@everyone' ];

    async messageHandler(_prefix: string, message: Message) {
        return this.handler(message.createdTimestamp, (message as any).startedProcessingTimestamp);
    }

    async interactionHandler(_prefix: string, interaction: Interaction) {
        return this.handler(interaction.createdTimestamp, (interaction as any).startedProcessingTimestamp);
    }

    async handler(createdTimestamp: number, startedProcessingTimestamp: number) {
        const timeSinceMessageCreation = (Date.now() - createdTimestamp) - client.ws.ping;
        const timeToProcessMessage = Date.now() - startedProcessingTimestamp;
        return `Pong!\nIt has been \`${timeSinceMessageCreation}ms\` since you sent that command.\nIt took me \`${timeToProcessMessage}ms\` to process this command.`;
    }
};
