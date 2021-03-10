import { Command } from '../../../command';
import type { Message, Client } from 'discord.js';
import canvacord from 'canvacord';
import { experienceToLevel, levelToExperience } from '../../../utils';
import { MessageAttachment } from 'discord.js';
import { TextChannel } from 'discord.js';

class Level implements Command {
    public name = 'level';

    async run(client: Client, message: Message, args: string[]) {
        // Bail unless we're in a guild and a member ran this
        if (!message.guild || !message.member) return;

        // We'll use the key often enough that simplifying it is worth the trouble.
        const pointsKey = `${message.guild.id}-${message.author.id}`;

        // Triggers on new users we haven't seen before.
        client.points.ensure(pointsKey, {
            user: message.author.id,
            guild: message.guild.id,
            points: 0,
            level: 1
        });

        // Build the rank card
        const leaderboard = [...client.points.entries()].reduce((a, e) => e[1] > a[1] ? e : a);
        const rank = leaderboard.findIndex(user => user[0] === pointsKey);
        const experience = Math.floor(client.points.get(pointsKey, 'points'));
        const currentLevel = experienceToLevel(experience);
        const nextLevelXp = levelToExperience(currentLevel + 1);
        const embed = new canvacord.Rank()
            .setAvatar(message.member?.user.displayAvatarURL({ format: 'png' }))
            .setCurrentXP(experience)
            .setLevel(currentLevel)
            .setRequiredXP(nextLevelXp - experience)
            .setRank(rank)
            // @ts-expect-error
            .setFontSize('26px')
            .setStatus(message.member?.presence.status || 'dnd')
            .setProgressBar('#FFFFFF', 'COLOR')
            .setUsername(message.member?.user.username, message.member?.displayHexColor)
            .setDiscriminator(message.member?.user.discriminator);

        const attachment = new MessageAttachment(await embed.build(), 'rank-card.png');
        await (message.channel as TextChannel).send(attachment);
    }
};

export const level = new Level();