import { ApplicationCommandOptionType, Command } from '@/command';
import { AppError } from '@/errors';
import { Interaction, Message, MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { parse as parseJson} from 'json5';

export class Test extends Command {
    public name = 'Test';
    public command = 'test';
    public timeout = 5000;
    public description = 'Run test commands.';
    public hidden = false;
    public owner = false;
    public examples = [];
    public roles = [];
    public options = [{
        name: 'embed',
        description: 'The content for the embed',
        type: ApplicationCommandOptionType.STRING,
    }]

    async parseJSON(content: string) {
        return parseJson(content);
    }

    async messageHandler(_prefix: string, _message: Message, args: string[]) {
        // Delete message
        await _message.delete();

        try {
            const embeds = await this.parseJSON(args.slice(1).join(' ').trim());
            return this.handler(Array.isArray(embeds) ? embeds : [embeds]);
        } catch (error) {
            return '```' + error + '```';
        }
    }

    interactionHandler(_prefix: string, _interaction: Interaction) {
        throw new AppError('This only works with legacy style commands!');
    }

    async handler(embeds: MessageEmbedOptions[]) {
        return embeds.map(embed => new MessageEmbed(embed));
    }
};
