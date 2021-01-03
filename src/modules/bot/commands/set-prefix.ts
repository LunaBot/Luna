import { Command, ApplicationCommandOptionType } from '@/command';
import { AppError } from '@/errors';
import { Server } from '@/servers';
import type { Interaction, Message } from 'discord.js';

export class SetPrefix extends Command {
    public name = 'Set Prefix';
    public command = 'set-prefix';
    public timeout = 5000;
    public description = 'Change the bot\'s prefix. The default is `!`. Use `@automod reset-prefix` to reset.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public options = [{
        name: 'prefix',
        type: ApplicationCommandOptionType.STRING,
        description: 'The new prefix, default is `!`',
        required: true
    }]
    public permissions = [];
    public roles = [];

    public async messageHandler(_prefix: string, message: Message, args: string[]) {
        return this.handler({ prefix: args[0] }, message.guild!.id);
    }

    public async interactionHandler(_prefix: string, interaction: Interaction) {
        return this.handler({ prefix: interaction.options?.find(option => option.name === 'prefix')!.value! }, interaction.guild!.id);
    }

    async handler(options: { prefix: string }, serverId: string) {
        // We need no more than 1 character
        if (options.prefix.length >= 2) {
            throw new AppError('Prefix can only be a single character!');
        }

        const server = await Server.findOrCreate({ id: serverId });
        try {
            await server.setPrefix(options.prefix);
            return `Set prefix to \`${options.prefix}\``;
        } catch (error) {
            return `Failed updating prefix to \`${options.prefix}\``;
        }
    }
};
