import { Message } from 'discord.js';
import { ApplicationCommandOptionType, Command } from '@/command';

export class Avatar extends Command {
    public name = 'Avatar';
    public command = 'avatar';
    public timeout = Command.TIMEOUTS.FIVE_SECONDS;
    public description = 'Get a member\s avatar link';
    public hidden = false;
    public owner = false;
    public examples = [
        '!avatar'
    ];
    public options = [{
        name: 'member',
        description: 'User whose avatar you want to see',
        type: ApplicationCommandOptionType.USER,
    }];

    async messageHandler(prefix: string, message: Message, args: string[]) {
        return this.handler(prefix, message, args);
    }

    // !avatar
    // !avatar @OmgImAlexis#1546
    // !avatar <@107834314439294976>
    async handler(_prefix: string, message: Message, _args: string[]) {
        const mention = message.mentions.users.first();
        if (mention) {
            return mention.displayAvatarURL({ format: 'png' });
        }

        return message.author.displayAvatarURL({ format: 'png' });
    } 
};
