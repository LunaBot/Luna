import { Message } from 'discord.js';
import join from 'url-join';
import { Command } from '../command';
import { config } from '../config';

class Profile extends Command {
    public name = 'profile';
    public command = 'profile';
    public timeout = 3000;
    public description = 'Get a member\s profile link';
    public hidden = false;
    public owner = false;
    public examples = [ '!profile' ];
    public roles = [ '@everyone' ];

    // !profile
    // !profile @OmgImAlexis#1546
    // !profile <@107834314439294976>
    async handler(_prefix: string, message: Message, _args: string[]) {
        const mention = (message.mentions.users as any)[0];
        if (mention) {
            return join(config.PUBLIC_URL, 'profile', mention.id);
        }

        return join(config.PUBLIC_URL, 'profile', message.author.id);
    } 
};

export default new Profile();
