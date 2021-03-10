import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { colours } from '../../../utils';
import { dedent } from 'dedent';
import { CommandError } from '../../../errors';

class BotInvite implements Command {
    public name = 'bot-invite';

    async run(client: Client, message: Message, args: string[]): Promise<void> {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        const clientId = client.user?.id;
        if (!clientId) {
            throw new CommandError('No client ID found');
        }

        // Send invite
        await message.channel.send(new MessageEmbed({
            description: dedent`
                You can invite me [here](https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=519366&scope=applications.commands%20bot)! :hearts:
            `,
            color: colours.DARK_PURPLE
        }));
	}
};

export const botInvite = new BotInvite();