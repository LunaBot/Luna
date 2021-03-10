import type { Client, Message } from 'discord.js';
import ml from 'ml-sentiment';

// Cap value between min and max.
const capValue = (number: number, min: number, max: number) => Math.max(min, Math.min(number, max));

/**
 * Get experience based on message sentiment.
 */
const getExperience = (client: Client, message: Message) => {
    const sentiment = ml().classify(message.content);
    const baseXp = 20;
    const sentimentPercentage = sentiment / 100;
    const experience = capValue(1 + (baseXp * sentimentPercentage), -20, 20);
    client.logger.silly('%s gained %s exp for "%s"', message.author.tag, experience, message.content);
    return experience;
}

export const message = async (client: Client, message: Message) => {
    // This stops if it's not a guild, and we ignore all bots.
    if (!message.guild || message.author.bot || !message.member) {
        return;
    }

    // Bail if it's a command
    const guildConfig = client.settings.get(message.guild.id)!;
    if (message.content.indexOf(guildConfig.prefix) === 0) {
        client.logger.debug('%s gained 0 exp for "%s" as it looks like a command.', message.author.tag, message.content);
        return;
    }

    // We'll use the key often enough that simplifying it is worth the trouble.
    const pointsKey = `${message.guild.id}-${message.author.id}`;

    // Triggers on new users we haven't seen before.
    client.points.ensure(pointsKey, {
        user: message.author.id,
        guild: message.guild.id,
        points: 0,
        level: 1
    });

    const experience = getExperience(client, message);
    client.points.math(pointsKey, '+', experience, 'points');

    // Calculate the user's current level
    const curLevel = Math.floor(0.1 * Math.sqrt(client.points.get(pointsKey, 'points')));

    // Act upon level up by sending a message and updating the user's level in enmap.
    if (client.points.get(pointsKey, 'level') < curLevel) {
        message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
        client.points.set(pointsKey, curLevel, 'level');
    }
};
