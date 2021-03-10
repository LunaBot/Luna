import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import { CommandError } from '../../../errors';
import { MessageEmbed } from 'discord.js';

class Avatar implements Command {
    public name = 'avatar';

    async run(client: Client, message: Message, args: string[]) {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        // Check cache first only if it's missing do a fetch
        const user = message.mentions.users.first() ?? (args[0] ? (client.users.cache.get(args[0]) ?? await client.users.fetch(args[0])) : undefined);

        // Couldn't resolve user
        if (!user && args.length >= 1) {
            throw new CommandError(`Couldn't resolve user ID ${args.join(' ')}`);
        }

        // Resolve member or reply with self
        const member = user || message.author;
        const iconUrl = member.displayAvatarURL({ dynamic: true, size: 256 });
        const avatarUrl = member.displayAvatarURL({ dynamic: true, size: 1024 });
        
        // Return avatar in embed
        await message.channel.send(new MessageEmbed({
            author: {
                name: member.username,
                iconURL: iconUrl
            },
            image: {
                url: avatarUrl
            }
        }));
    }
};

export const avatar = new Avatar();